import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

const VIEWS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState(VIEWS.DAY);

  const apiVersion = "v0";
  const language = "en";
  const calendar = "default";

  const fetchEvents = async (date, view) => {
    setLoading(true);
    setError(null);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    try {
      let response;
      switch (view) {
        case VIEWS.DAY:
          response = await axios.get(
            `http://calapi.inadiutorium.cz/api/${apiVersion}/${language}/calendars/${calendar}/${year}/${month}/${day}`
          );
          setEvents([{ date, celebrations: response.data.celebrations }]);
          break;
        case VIEWS.WEEK:
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          const weekEvents = [];
          for (
            let d = new Date(startOfWeek);
            d <= endOfWeek;
            d.setDate(d.getDate() + 1)
          ) {
            response = await axios.get(
              `http://calapi.inadiutorium.cz/api/${apiVersion}/${language}/calendars/${calendar}/${d.getFullYear()}/${
                d.getMonth() + 1
              }/${d.getDate()}`
            );
            weekEvents.push({
              date: new Date(d),
              celebrations: response.data.celebrations,
            });
          }
          setEvents(weekEvents);
          break;
        case VIEWS.MONTH:
          response = await axios.get(
            `http://calapi.inadiutorium.cz/api/${apiVersion}/${language}/calendars/${calendar}/${year}/${month}`
          );
          const monthEvents = response.data.map((day) => ({
            date: new Date(year, month - 1, day.day),
            celebrations: day.celebrations,
          }));
          setEvents(monthEvents);
          break;
        default:
          break;
      }
    } catch (err) {
      setError("Error fetching events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(selectedDate, view);
  }, [selectedDate, view]);

  const formatDate = (date) => {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold text-center">
        Church Calendar Events
      </h1>
      <div className="w-full mx-auto p-5 text-center flex justify-center items-start space-x-10">
        <div>
          <div className="mb-5 inline-block">
            <DatePicker
              inline
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd-MM-yyyy"
              className="border p-2"
            />
          </div>
          <div className="mb-5">
            <button
              onClick={() => setView(VIEWS.DAY)}
              className="mr-2 p-2 bg-blue-500 text-white rounded"
            >
              Day View
            </button>
            <button
              onClick={() => setView(VIEWS.WEEK)}
              className="mr-2 p-2 bg-blue-500 text-white rounded"
            >
              Week View
            </button>
            <button
              onClick={() => setView(VIEWS.MONTH)}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Month View
            </button>
          </div>
        </div>
        <div className="flex-1 max-h-96 overflow-y-auto text-left">
          {loading && <p>Loading events...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && events.length > 0 && (
            <ul className="list-none p-0">
              {events.map((event, index) => (
                <li key={index} className="mb-5">
                  <h2 className="mb-2 text-lg font-semibold">
                    {event.date instanceof Date && !isNaN(event.date.getTime())
                      ? formatDate(event.date)
                      : "Invalid Date"}
                  </h2>
                  <ul className="list-none p-0 pl-4">
                    {event.celebrations.map((celebration, subIndex) => (
                      <li
                        key={subIndex}
                        className="bg-gray-100 mb-2 p-3 rounded shadow-sm"
                      >
                        <h3 className="mb-1 text-md font-medium">
                          {celebration.title || "No Title"}
                        </h3>
                        <p className="mb-1">Colour: {celebration.colour}</p>
                        <p className="mb-1">Rank: {celebration.rank}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          {!loading && !error && events.length === 0 && (
            <p>No events found for this date.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
