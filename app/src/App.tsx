import DataProvider from "./core/data.provider";
import Dashboard from "./Dashboard";

function App() {
  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}

export default App;
