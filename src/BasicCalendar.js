import React, { Component } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import {Container, Button} from 'react-bootstrap'
import { RRule } from 'rrule'
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventManager from './modules/EventManager'

const localizer = momentLocalizer(moment);

class BasicCalendar extends Component {
  state = {
    events: null
  }

  componentWillMount(){
  // async getEvents(){

    let calendarEvents = []

      EventManager.getAll()
      .then(apiEvents => {
        console.log('apiEvents', apiEvents)
        // the events I am receiving from the DB already have ical_string populated if they
        // are a recurring event; null ical_string if they are not
        const convertedEvents = apiEvents.map(({ id, title, start, end, ical_string, ...rest }) => {

          //parse moment object in UTC time; receiving UTC time from DB
          const mStart = moment.utc(start);
          const mEnd = moment.utc(end);

          return {
            id: id,
            title: title,
            start: mStart,
            end: mEnd,
            duration: mEnd.diff(mStart),
            rrule: (ical_string !== null ? RRule.fromString(ical_string) : ical_string),

            // Add any additional key/value pairs here. i.e. if you add a new key "foo" to an apiEvent, it will
            // automatically be stuck in here (avoids possibility of forgetting to modify it)
            ...rest
          };
        });

        convertedEvents.forEach(event => {
          // if the the event has a rrule
          if (event.rrule !== null) {
            const occurrences = event.rrule.all();

            //collects and adds each recurring event to the calendarEvents array
            occurrences.forEach(calEventDt => {
              const m = moment(calEventDt);

              calendarEvents.push(
                {
                  id: event.id,
                  title: event.title,
                  start: calEventDt,
                  //adds the duration to the start date's moment object and coverts to date
                  end: m.add(event.duration).toDate()
                },
              )
            })
          } else {

            calendarEvents.push(
              {
                id: event.id,
                title: event.title,
                //conversion to Date makes week/day views work
                start: event.start.toDate(),
                end: event.end.toDate()
              },
            )
          }
        })
        
      })
    console.log('calendarEvents: ', calendarEvents)
    this.setState({
      events: calendarEvents
    })

  }

  // componentDidMount(){
  //   this.getEvents();
  // }

  // shouldComponentUpdate(nextState){
  //   return this.state.events !== nextState.events
  // }

  render() {
    console.log("this.state.events", this.state.events)
    return (
      <Container>
        {/* {this.state.events === null ?
        <Container>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </Container>
        :
        <div> */}
          <div style={{ height: '400pt', margin: '2em'}}>
            <Calendar
              events={this.state.events}
              startAccessor="start"
              endAccessor="end"
              defaultDate={moment().toDate()}
              localizer={localizer}
              onSelectEvent={event => {this.props.history.push(`/calendar/${event.id}/edit`)}}
            />
          </div>
          <Button variant="success" onClick={()=>this.props.history.push('/calendar/create')}>Create New Event</Button>
        {/* </div>
        } */}
      </Container>
    );
  }
}


export default BasicCalendar
