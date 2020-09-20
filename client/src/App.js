import React, { Component } from 'react';
import Form from "./components/Form";
import Count from "./components/Count";
import API from "./utils/API";
import 'office-ui-fabric-react/dist/css/fabric.css';
import "./assets/css/style.css"

class App extends Component {
  constructor() {
    super();
    this.state = {
      file: {},
      isParsing: false,
      id: null,
      fileName: "",
      parsedPDF: "",
      wordCount: null,
    };
    this.updateUpload = this.updateUpload.bind(this);
  }

  componentDidMount() {
    API.getPaper().then(res => {
      if (res.data) {
        this.setState({
          id: res.data.id,
          fileName: res.data.fileName,
          parsedPDF: res.data.text,
          wordCount: res.data.wordCount
        });
      }
    });
  }

  updateUpload(file) {
    if (this.state.id) {
      API.deletePaper(this.state.id).then(res => {
        console.log(res.data + " record affected");
      });
    }
    this.setState({
      file: file,
      isParsing: true,
      parsedPDF: "",
      wordCount: null
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-6 offset-lg-3">
            <Form updateUpload={this.updateUpload} />
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-lg-6 offset-lg-3">
            <Count
              fileName={this.state.file.name || this.state.fileName}
              isParsing={this.state.isParsing}
              parsedPDF={this.state.parsedPDF}
              wordCount={this.state.wordCount}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
