import React, { Component } from "react"
import EventManager from "./modules/EventManager"

class EventEditForm extends Component {
    state = {
      title: "",
      start: null,
      end: null,
      recurring: null,
      count: null,
      start_duration: null,
      end_duration: null,
      loadingStatus: true,
    };

    handleFieldChange = evt => {
      const stateToChange = {}
      stateToChange[evt.target.id] = evt.target.value
      this.setState(stateToChange)
    }

    updateExistingEvent = evt => {
      evt.preventDefault()
      this.setState({ loadingStatus: true });
      const editedEvent = {
        id: this.props.match.params.eventId,
        title: this.state.title,
        start: this.state.start,
        end: this.state.end,
        recurring: this.state.recurring,
        count: this.state.count,
        start_duration: this.state.start_duration,
        end_duration: this.state.end_duration,
        ical_string: null,
      };

      EventManager.update(editedEvent)
      .then(() => this.props.history.push("/calendar"))
    }

    componentDidMount() {
      EventManager.get(this.props.match.params.eventId)
      .then(event => {
          this.setState({
            title: event.title,
            start: event.start,
            end: event.end,
            recurring: event.recurring,
            count: event.count,
            start_duration: event.start_duration,
            end_duration: event.end_duration,
            ical_string: event.ical_string,
            loadingStatus: false,
          });
      });
    }

    render() {
      return (
        <>
        <form>
          <fieldset>
            <div>

              <label htmlFor="title">Title: </label>
              <input
                type="text"
                required
                onChange={this.handleFieldChange}
                id="title"
                value={this.state.title}
              /><br/>

              <label htmlFor="start">Start: </label>
              <input
                // type="datetime-local"
                type="text"
                required
                onChange={this.handleFieldChange}
                id="start"
                value={this.state.start}
                // value={new Date(this.state.start).toISOString().slice(0,16)}
              /><br/>

              <label htmlFor="end">End: </label>
              <input
                // type="datetime-local"
                type="text"
                required
                onChange={this.handleFieldChange}
                id="end"
                value={this.state.end}
                // value={new Date(this.state.end).toISOString().slice(0,16)}
              /><br/>

              <label htmlFor="recurring">Recurring: </label>
              <select
                id="recurring"
                value={this.state.recurring}
                onChange={this.handleFieldChange}
                >
                <option></option>
                <option value='DOES-NOT-REPEAT'>Does Not Repeat</option>
                <option value='DAILY'>Daily</option>
                <option value='WEEKLY'>Weekly</option>
                <option value='MONTHLY'>Monthly</option>
                <option value='YEARLY'>Yearly</option>
              </select><br/>

              <label htmlFor="count">Count: </label>
              <input
                type="text"
                required
                onChange={this.handleFieldChange}
                id="count"
                value={this.state.count}
              /><br/>

              <label htmlFor="start_duration">When will this recurring event start? </label>
              <input
                // type="datetime-local"
                type="text"
                required
                onChange={this.handleFieldChange}
                id="start_duration"
                value={this.state.start_duration}
                // value={new Date(this.state.start_duration).toISOString().slice(0,16)}
              /><br/>

              <label htmlFor="end_duration">Until when will this recurring event keep occuring? </label>
              <input
                // type="datetime-local"
                type="text"
                required
                onChange={this.handleFieldChange}
                id="end_duration"
                value={this.state.end_duration}
                // value={new Date(this.state.end_duration).toISOString().slice(0,16)}
              /><br/>

            </div>
            <div className="alignRight">
              <button disabled={this.state.loadingStatus}
                onClick={this.updateExistingEvent}
              >Submit</button>
            </div>
          </fieldset>
        </form>
        </>
      );
    }
}

export default EventEditForm