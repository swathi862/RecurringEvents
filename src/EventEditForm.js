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
      end_recurrence: "",
      ical_string: "",
      loadingStatus: true,
      form_validated: false,
    };

    handleFieldChange = evt => {
      const stateToChange = {}
      stateToChange[evt.target.id] = evt.target.value
      this.setState(stateToChange)
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

    updateExistingEvent = evt => {
        if ((this.state.title) && (this.state.start) && (this.state.end)){
            let rule = null;
            evt.preventDefault()
            this.setState({ loadingStatus: true });
            
            if((this.state.recurring !== null) && 
            (this.state.recurring !== "DOES-NOT-REPEAT") && 
            (this.state.recurring !== "") && 
            (this.state.count) &&
            (this.state.end_recurrence)){

                    rule = new RRule({
                        freq: this.frequency(this.state.recurring), 
                        count: this.state.count,
                        dtstart: new Date(this.state.start),
                        until: new Date(this.state.end_recurrence)
                    }).toString()
                    console.log(rule)
                    
            }
            
            if((this.state.count) && (this.state.end_recurrence) && (rule !== null)) {
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
                var ical_array = this.state.ical_string.split(';').map(ical_option => ical_option.split('='))
                
                this.setState({
                    recurring: ((ical_array[0])[1]),
                    count: (ical_array[1])[1],
                    end_recurrence: moment.utc((ical_array[2])[1]).local().format('YYYY-MM-DDTHH:mm:ss')
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
                                <option value=''></option>
                                <option value='DOES-NOT-REPEAT'>Does Not Repeat</option>
                                <option value='DAILY'>Daily</option>
                                <option value='WEEKLY'>Weekly</option>
                                <option value='MONTHLY'>Monthly</option>
                                <option value='YEARLY'>Yearly</option>
                            </Form.Control>
                            </Col>
                    </Form.Row>

                    {(this.state.recurring !== null) && (this.state.recurring !== 'DOES-NOT-REPEAT') && (this.state.recurring !== '') &&
                        <>
                        <Form.Row>
                            <Form.Label column lg={3} className="required">How many times will this event occur? </Form.Label>
                            <Col xs={4}>
                                <Form.Control
                                    type="text"
                                    required
                                    onChange={this.handleFieldChange}
                                    id="count"
                                    value={this.state.count}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid number.
                                </Form.Control.Feedback>
                                </Col>
                        </Form.Row><br/>

                        <Form.Row>
                            <Form.Label column lg={3} className="required">Until when will this recurring event keep occuring? </Form.Label>
                            <Col xs={4}>
                                <Form.Control
                                    type="datetime-local"
                                    required
                                    onChange={this.handleFieldChange}
                                    id="end_recurrence"
                                    min={this.state.end}
                                    value={this.state.end_recurrence}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid recurring end date/time.
                                </Form.Control.Feedback>
                                </Col>
                        </Form.Row><br/>
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