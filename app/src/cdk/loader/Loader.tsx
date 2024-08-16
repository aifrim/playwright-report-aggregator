import "./loader.scss";

export type LoaderProps = {
  message?: string;
};

export default function Loader(props: LoaderProps) {
  const message = props.message;

  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        <div className="loader"></div>
      </div>
      {message ? <div className="loader-message">{message}</div> : null}
    </div>
  );
}
