import { PropsWithChildren, useEffect, useState } from "react";
import Loader from "../cdk/loader/Loader";
import { Data } from "./data.context";
import { Report } from "./use-reports";

export default function DataProvider(props: PropsWithChildren) {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<Report[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const sources: string[] = await fetch("/sources.json").then(
          (response) => response.json()
        );

        const data = await Promise.all(
          sources.map((source: string) =>
            fetch(source).then((response) => response.json())
          )
        );

        setData(data);
        setLoaded(true);
      } catch (error) {
        // TODO: Could not load data
        // Show a dedicated component to handle this case
        console.error(error);
      }
    }

    fetchData();
  }, []);

  if (!loaded) {
    return <Loader />;
  }

  return <Data.Provider value={data}>{props.children}</Data.Provider>;
}
