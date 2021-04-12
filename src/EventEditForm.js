import React, { Component } from "react"
import { Container, Form, FormLabel, Button, Col } from "react-bootstrap";
import { RRule } from 'rrule'
import moment from 'moment';
import EventManager from "./modules/EventManager"

class EventEditForm extends Component {
    state = {
      title: "",
      start: "",
      end: "",
      recurring: "",
      count: "",
      by_day: [],
      end_recurrence: "",
      ical_string: "",
      text_rule: "",
      loadingStatus: true,
      form_validated: false,
    };

    handleFieldChange = evt => {
      const stateToChange = {}
      stateToChange[evt.target.id] = evt.target.value
      this.setState(stateToChange)
    }

    handleMultipleInputChange = (event) => {
        const value = Array.from(event.target.selectedOptions, (item) => item.value);
        this.setState({by_day: value});
    }

    handleValidation = (event) => {
      this.setState({ form_validated: true });
      this.updateExistingEvent(event)
    }

    frequency = (eventFrequency) => {
        if(eventFrequency === 'YEARLY'){
          return RRule.YEARLY
        }
        else if(eventFrequency === 'MONTHLY'){
          return RRule.MONTHLY
        }
        else if(eventFrequency === 'WEEKLY'){
          return RRule.WEEKLY
        }
        else if(eventFrequency === 'DAILY'){
          return RRule.DAILY
        }
    }

    byday = (dayFrequency) => {
        var days = []
        if(dayFrequency){
            dayFrequency.forEach(day => {
                if (day === "MO"){
                    days.push(RRule.MO)
                }else if (day === "TU"){
                    days.push(RRule.TU)
                }else if(day === "WE"){
                    days.push(RRule.WE)
                }else if(day === "TH"){
                    days.push(RRule.TH)
                }else if(day === "FR"){
                    days.push(RRule.FR)
                }else if(day === "SA"){
                    days.push(RRule.SA)
                }else if(day === "SU"){
                    days.push(RRule.SU)
                }
            })
            return days
        }
    }

    updateExistingEvent = evt => {
        if ((this.state.title) && (this.state.start) && (this.state.end)){
            let rule = null;
            let untilValue;
            evt.preventDefault()
            this.setState({ loadingStatus: true });
            
            if((this.state.recurring !== null) && 
            (this.state.recurring !== "DOES-NOT-REPEAT") && 
            (this.state.end_recurrence || this.state.count)){

                if(this.state.end_recurrence !== null){
                    untilValue = new Date(this.state.end_recurrence)
                }else{
                    untilValue = null
                }

                    rule = new RRule({
                        freq: this.frequency(this.state.recurring), 
                        byweekday: this.byday(this.state.by_day),
                        count: this.state.count,
                        dtstart: new Date(this.state.start),
                        until: untilValue
                    }).toString()
                    console.log(rule)
                    
            }
            if((this.state.recurring === 'YEARLY') || (this.state.recurring === 'MONTHLY') || (this.state.recurring === 'WEEKLY') || (this.state.recurring === 'DAILY'))
            {
                if((this.state.count || this.state.end_recurrence) && (rule !== null)) {
                    const editedEvent = {
                        id: this.props.match.params.eventId,
                        title: this.state.title,
                        start: moment(this.state.start),
                        end: moment(this.state.end),
                        ical_string: rule,
                    };
    
                    EventManager.update(editedEvent)
                    .then(() => this.props.history.push("/calendar"))
                }
            } else {
                const editedEvent = {
                    id: this.props.match.params.eventId,
                    title: this.state.title,
                    start: moment(this.state.start),
                    end: moment(this.state.end),
                    ical_string: rule,
                };

                EventManager.update(editedEvent)
                .then(() => this.props.history.push("/calendar"))
            }
            
        }
    }

    componentDidMount() {
      EventManager.get(this.props.match.params.eventId)

      .then(event => {
        console.log(moment.utc(event.start).local().format('YYYY-MM-DDTHH:mm:ss'))

          this.setState({
            title: event.title,
            start: moment.utc(event.start).local().format('YYYY-MM-DDTHH:mm:ss'),
            end: moment.utc(event.end).local().format('YYYY-MM-DDTHH:mm:ss'),
            ical_string: event.ical_string,
            loadingStatus: false,
          })
            if(this.state.ical_string){
                var days;
                var daysArray = []
                var stringCount = null; 
                var until = null;

                var ical_array = this.state.ical_string.split(';').map(ical_option => ical_option.split('='))
                console.log(ical_array)

                if(ical_array.length > 2){

                    if(((ical_array[1])[0]) === "BYDAY"){
                        days = (ical_array[1])[1]
                        daysArray = days.split(',')
                    } else if (((ical_array[1])[0]) === "COUNT"){
                        stringCount = (ical_array[1])[1]
                    } else if (((ical_array[1])[0]) === "UNTIL"){
                        until = moment.utc((ical_array[1])[1]).local().format('YYYY-MM-DDTHH:mm:ss')
                    }
    
                    if(((ical_array[ical_array.length - 2])[0]) === "COUNT"){
                        stringCount = (ical_array[ical_array.length - 2])[1]
                        console.log(((ical_array[ical_array.length - 2])[0]))
                    } else if(((ical_array[2])[0]) === "COUNT"){
                        stringCount = (ical_array[2])[1]
                    }
    
                    if (((ical_array[ical_array.length - 1])[0]) === "UNTIL"){
                        until = moment.utc((ical_array[ical_array.length - 1])[1]).local().format('YYYY-MM-DDTHH:mm:ss')
                    }

                }
                else{
                    if (((ical_array[1])[0]) === "COUNT"){
                        stringCount = (ical_array[1])[1]
                    } else if (((ical_array[1])[0]) === "UNTIL"){
                        until = moment.utc((ical_array[1])[1]).local().format('YYYY-MM-DDTHH:mm:ss')
                    }
                }


                this.setState({
                    recurring: ((ical_array[0])[1]),
                    by_day: daysArray,
                    count: stringCount,
                    end_recurrence: until,
                    text_rule: RRule.fromString(this.state.ical_string).toText()
                })
            } else{
                this.setState({
                    recurring: 'DOES-NOT-REPEAT'
                })
            }
            
          });
    }

    render() {
      return (
        <Container><br/>
        <h2>Edit <em>'{this.state.title}'</em></h2><br/>
            <Form noValidate validated={this.state.form_validated}>
                <div>
                <Container>

                    <Form.Row>
                        <FormLabel column lg={1} className="required">Title: </FormLabel>
                        <Col xs={4}>
                        <Form.Control
                            type="text"
                            required
                            onChange={this.handleFieldChange}
                            id="title"
                            value={this.state.title}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a title/name for this event.
                        </Form.Control.Feedback>
                        </Col>
                    </Form.Row><br/>

                    <Form.Row>
                        <Form.Label column lg={1} className="required">Start: </Form.Label>
                        <Col xs={4}>
                            <Form.Control
                                type="datetime-local"
                                required
                                onChange={this.handleFieldChange}
                                id="start"
                                value={this.state.start}
                            />
                            <Form.Control.Feedback type="invalid">
                            Please provide a valid start date/time.
                        </Form.Control.Feedback>
                        </Col>
                    </Form.Row><br/>

                    <Form.Row>
                        <Form.Label column lg={1} className="required">End: </Form.Label>
                        <Col xs={4}>
                            <Form.Control
                                type="datetime-local"
                                required
                                onChange={this.handleFieldChange}
                                id="end"
                                min={this.state.start}
                                value={this.state.end}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid end date/time.
                            </Form.Control.Feedback>
                            </Col>
                    </Form.Row><br/>

                    <Form.Row>
                        <Form.Label column lg={1} className="required">Recurring: </Form.Label>
                        <Col xs={4}>
                            <Form.Control as="select"
                                id="recurring"
                                value={this.state.recurring}
                                onChange={this.handleFieldChange}
                            >
                                <option value='DOES-NOT-REPEAT'></option>
                                <option value='DOES-NOT-REPEAT'>Does Not Repeat</option>
                                <option value='DAILY'>Daily</option>
                                <option value='WEEKLY'>Weekly</option>
                                <option value='MONTHLY'>Monthly</option>
                                <option value='YEARLY'>Yearly</option>
                            </Form.Control>
                            </Col>
                    </Form.Row>

                    {(this.state.recurring !== null) && (this.state.recurring !== 'DOES-NOT-REPEAT') &&
                        <>
                        {this.state.end_recurrence ?
                        <>
                            <Form.Row>
                            <Form.Label column lg={3}>How many times will this event occur? </Form.Label>
                            <Col xs={4}>
                            <Form.Control
                                    type="text"
                                    onChange={this.handleFieldChange}
                                    id="count"
                                    value={this.state.count}
                                />
                                </Col>
                            </Form.Row><br/>
                        </>
                        :
                        <>
                            <Form.Row>
                            <Form.Label column lg={3} className="required">How many times will this event occur? </Form.Label>
                            <Col xs={4}>
                                <Form.Control
                                    type="text"
                                    onChange={this.handleFieldChange}
                                    required
                                    value={this.state.count}
                                    id="count"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid number.
                                </Form.Control.Feedback>
                                </Col>
                            </Form.Row><br/>
                        </>
                        }

                        {this.state.count ?
                        <>
                            <Form.Row>
                            <Form.Label column lg={3}>Until when will this recurring event keep occuring? </Form.Label>
                            <Col xs={4}>
                                <Form.Control
                                    type="datetime-local"
                                    onChange={this.handleFieldChange}
                                    min={this.state.end}
                                    id="end_recurrence"
                                    value={this.state.end_recurrence}
                                />
                                </Col>
                            </Form.Row><br/>
                        </> 
                        :
                        <>
                            <Form.Row>
                            <Form.Label column lg={3} className="required">Until when will this recurring event keep occuring? </Form.Label>
                            <Col xs={4}>
                                <Form.Control
                                    type="datetime-local"
                                    onChange={this.handleFieldChange}
                                    min={this.state.end}
                                    required
                                    id="end_recurrence"
                                    value={this.state.end_recurrence}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid recurring end date/time.
                                </Form.Control.Feedback>
                                </Col>
                            </Form.Row><br/>
                        </>   
                        }

                        <Form.Row>
                            <Form.Label column lg={3}>Repeats on? </Form.Label>
                            <Col xs={4}>
                            <Form.Control as="select" multiple
                                id="by_day"
                                value={this.state.by_day}
                                onChange={this.handleMultipleInputChange}
                            >
                                <option value="SU">Sunday</option>
                                <option value="MO">Monday</option>
                                <option value="TU">Tuesday</option>
                                <option value="WE">Wednesday</option>
                                <option value="TH">Thursday</option>
                                <option value="FR">Friday</option>
                                <option value="SA">Saturday</option>
                            </Form.Control>
                            </Col>
                        </Form.Row><br/>

                        <Form.Row>
                            <p><strong>This event recurs: </strong>{this.state.text_rule}</p>
                        </Form.Row>

                        </> 
                    }
                </Container>
                </div>

            <div>
              <Button variant="primary" onClick={this.handleValidation}>Submit Changes</Button>
            </div>
            

        </Form>
        </Container>
      );
    }
}

export default EventEditForm