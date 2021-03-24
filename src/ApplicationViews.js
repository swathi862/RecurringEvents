import { Route } from 'react-router-dom'
import React, { Component } from 'react'
import BasicCalendar from './BasicCalendar'
import EventEditForm from './EventEditForm'
import NewEventForm from './NewEventForm'

class ApplicationViews extends Component {
  
    render() {
        return (
            <>
                <Route exact path="/calendar" component={BasicCalendar}/>
                <Route path="/calendar/create" component={NewEventForm}/>
                <Route path="/calendar/:eventId(\d+)/edit" render={props => {
                    return <EventEditForm {...props} />
                }}
                />
            </>
        )
    }
}

export default ApplicationViews