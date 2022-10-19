import '../App.css';

function Search({ data, searchReactor }: any) {
  const reactorSelections = data.map((reactor: any) => {
    return (
      <option
        key={Math.random()}
        value={reactor.name}
      >
        {reactor.name}
      </option>
    );
  });

  return (
    <div className="container container__appSearch">
      <form onSubmit={searchReactor}>
        <input
          className="searchBtn"
          type="text"
          list="reactors"
          name="searchReactor"
          id="searchReactor"
          placeholder="Input reactor name"
        />
        <datalist id="reactors">{reactorSelections}</datalist>
        <input
          className="submitBtn"
          type="submit"
          value="Search Database"
        />
      </form>
    </div>
  );
}

export default Search;
