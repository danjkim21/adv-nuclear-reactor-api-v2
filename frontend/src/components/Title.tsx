import '../App.css';

function Title({ appTitle }) {
  return (
    <div className="container container__appTitle">
      <h1 className="header__appTitle">{appTitle}</h1>
      <span className='container container__icon'>
        <i className="fa-solid fa-bolt"></i>
      </span>
    </div>
  );
}

export default Title;
