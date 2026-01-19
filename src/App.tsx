import "./App.css";
import HistoryPeriods from "./components/HistoryPeriods/HistoryPeriods";
import { mockData } from "./mock-data";

function App() {
  return (
    <div className="App">
      <HistoryPeriods periods={mockData} title="Исторические даты" />
    </div>
  );
}

export default App;
