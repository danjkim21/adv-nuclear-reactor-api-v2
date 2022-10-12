import '../App.css';

function Desc({ appDesc }) {
  return (
    <div className="container container__appDesc">
      <p className="text__appDesc">{appDesc}</p>
    </div>
  );
}

export default Desc;
