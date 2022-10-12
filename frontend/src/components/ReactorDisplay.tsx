import '../App.css';

function ReactorDisplay({ reactorData }) {
  console.log(reactorData);
  return (
    <section className="section__displayArea">
      <div className="container container__reactorTitle">
        <h2 className="title__reactorName">
          {reactorData[0].name}{' '}
          <span>
            (
            <a
              href={`https://aris.iaea.org/PDF/${
                reactorData[0].nameWebsite.split('\\')[2]
              }`}
              target="_blank"
            >
              {reactorData[0].fullName}
            </a>
            )
          </span>
        </h2>
      </div>
      <div className="container container__overview">
        <h3>Overview</h3>
        <table>
          <tbody>
            <tr>
              <td>Vendor</td>
              <td><a href={reactorData[0].designOrgWebsite}>{reactorData[0].designOrg}</a></td>
            </tr>
            <tr>
              <td>Country of Origin</td>
              <td>{reactorData[0].country}</td>
            </tr>
            <tr>
              <td>Design Status</td>
              <td>{reactorData[0].designStatus}</td>
            </tr>
            <tr>
              <td>Purpose</td>
              <td>{reactorData[0].purpose}</td>
            </tr>
            <tr>
              <td>Reactor Type</td>
              <td>{reactorData[0].type}</td>
            </tr>
            <tr>
              <td>Neutron Spectrum</td>
              <td>{reactorData[0].neutronSpectrum}</td>
            </tr>
            <tr>
              <td>Coolant</td>
              <td>{reactorData[0].coolant}</td>
            </tr>
            <tr>
              <td>Moderator</td>
              <td>{reactorData[0].moderator}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ReactorDisplay;
