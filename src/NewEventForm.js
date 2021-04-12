import moment from "moment";
import React, { Component } from "react"
import { Container, Form, FormLabel, Button, Col } from "react-bootstrap";
import { RRule } from 'rrule'
import EventManager from "./modules/EventManager"
import './EventForm.css'

class NewEventForm extends Component {
    state = {
      title: "",
      start: null,
      end: null,
      recurring: null,
      by_day: [],
      count: null,
      end_recurrence: null,
      loadingStatus: true,
      form_validated: false,
    };

    handleFieldChange = (event) => {
      const stateToChange = {}
      stateToChange[event.target.id] = event.target.value
      this.setState(stateToChange)
    }

    handleMultipleInputChange = (event) => {
        const value = Array.from(event.target.selectedOptions, (item) => item.value);
        this.setState({by_day: value});
    }

    handleValidation = (event) => {
        this.setState({form_validated: true})
        this.createEvent(event)
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

    createEvent = evt => {
      if ((this.state.title !== "") && (this.state.start !== null) && (this.state.end !== null)){
        let rule = null;
        evt.preventDefault()
        this.setState({ loadingStatus: true });

        console.log(this.state.by_day)

        if((this.state.recurring !== null) && 
           (this.state.recurring !== 'DOES-NOT-REPEAT') && 
           (this.state.count || this.state.end_recurrence)){

            rule = new RRule({
                freq: this.frequency(this.state.recurring), 
                byweekday: this.byday(this.state.by_day),
                count: this.state.count,
                dtstart: new Date(this.state.start),
                until: this.state.end_recurrence
            }).toString()
            console.log(rule)
        }

        if((this.state.recurring === 'YEARLY') || (this.state.recurring === 'MONTHLY') || (this.state.recurring === 'WEEKLY') || (this.state.recurring === 'DAILY'))
        {
            if((this.state.count || this.state.end_recurrence) && (rule !== null)) {
                const newEvent = {
                    title: this.state.title,
                    start: moment(this.state.start),
                    end: moment(this.state.end),
                    ical_string: rule,
                };
                console.log("newEvent", newEvent)
                EventManager.post(newEvent)
                .then(() => this.props.history.push("/calendar"))
            }
        } else {
            const newEvent = {
                title: this.state.title,
                start: moment(this.state.start),
                end: moment(this.state.end),
                ical_string: rule,
            };
            console.log("newEvent", newEvent)
            EventManager.post(newEvent)
            .then(() => this.props.history.push("/calendar"))
        }
      }
    }

    render() {
      return (
        <Container><br/>
            <h2>Create New Event</h2><br/>
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
                            min={this.state.start}
                            id="end"
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
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid recurring end date/time.
                            </Form.Control.Feedback>
                            </Col>
                        </Form.Row><br/>
                    </>   
                    }

                    {/* <Form.Row>
                        <Form.Label column lg={3} className="required">Until when will this recurring event keep occuring? </Form.Label>
                        <Col xs={4}>
                            <Form.Control
                                type="datetime-local"
                                onChange={this.handleFieldChange}
                                min={this.state.end}
                                required
                                id="end_recurrence"
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid recurring end date/time.
                            </Form.Control.Feedback>
                            </Col>
                    </Form.Row><br/> */}

                    <Form.Row>
                            <Form.Label column lg={3}>Repeats on? </Form.Label>
                            <Col xs={4}>
                            <Form.Control as="select" multiple
                                id="by_day"
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
                    </> 
                }
                </Container>

                </div>

                <div>
                    <Button variant="primary" onClick={this.handleValidation}>Create</Button>
                </div>

            </Form>
        </Container>
      );
    }
}

export default NewEventForm