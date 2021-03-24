import React, { Component } from "react"
import EventManager from "./modules/EventManager"

class NewEventForm extends Component {
    state = {
      title: "",
      start: null,
      end: null,
      recurring: null,
      count: 0,
      start_duration: null,
      end_duration: null,
      loadingStatus: true,
    };

    handleFieldChange = evt => {
      const stateToChange = {}
      stateToChange[evt.target.id] = evt.target.value
      this.setState(stateToChange)
    }

    createEvent = evt => {
      evt.preventDefault()
      this.setState({ loadingStatus: true });
      const newEvent = {
        title: this.state.title,
        start: this.state.start,
        end: this.state.end,
        recurring: this.state.recurring,
        count: this.state.count,
        start_duration: (!this.state.start_duration ? this.state.start : new Date()),
        end_duration: (!this.state.end_duration ? this.state.end : new Date()),
        ical_string: null,
      };

      EventManager.post(newEvent)
      .then(() => this.props.history.push("/calendar"))
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
              /><br/>

              <label htmlFor="start">Start: </label>
              <input
                type="datetime-local"
                required
                onChange={this.handleFieldChange}
                id="start"
              /><br/>

              <label htmlFor="end">End: </label>
              <input
                type="datetime-local"
                required
                onChange={this.handleFieldChange}
                id="end"
              /><br/>

              <label htmlFor="recurring">Recurring: </label>
              <select
                id="recurring"
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
                onChange={this.handleFieldChange}
                id="count"
              /><br/>

              <label htmlFor="start_duration">When will this recurring event start? </label>
              <input
                type="datetime-local"
                onChange={this.handleFieldChange}
                id="start_duration"
              /><br/>

              <label htmlFor="end_duration">Until when will this recurring event keep occuring? </label>
              <input
                type="datetime-local"
                onChange={this.handleFieldChange}
                id="end_duration"
              /><br/>

            </div>
            <div className="alignRight">
              <button onClick={this.createEvent}>Create</button>
            </div>
          </fieldset>
        </form>
        </>
      );
    }
}

export default NewEventForm