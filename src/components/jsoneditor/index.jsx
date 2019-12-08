import React from 'react';
import ReactDOM from 'react-dom';
import FileSaver from 'file-saver';
import JSONEditor from 'jsoneditor';
import { dcrcontent } from './store/dcr-content';

let jsoneditor = '';
let json_file_name = 'document.json';
const media_blob_map = {'file': 'data:text/plain;charset=utf-8'};
const json_mode = {'default': 'code', 'alternate': 'tree'};
const dom_selector_map = {
  'app': 'app',
  'fileEl': 'file-elem',
  'editAdvLabel': 'label[for="edit-advanced"]',
  'jsonEditorId': 'jsoneditor',
  'jsonBodyWrapperId': 'json_body_wrapper',
  'json_content_field_id': 'edit-field-json-content-0-value',
  'json_content_edit_form_id': 'node-json-editor-content-edit-form'
};
const css = {
  'extended_button_styles': {margin: '0 0 0 1rem'},
  'file_element': {display: 'none'},
  'json_tool_bar': {border: '1px'}
};

class JsonEditorComponent extends React.Component {

  constructor(props) {
      super(props);
      this.switchJsonEditorDisplay = this.switchJsonEditorDisplay.bind(this);
      this.saveJsonContent = this.saveJsonContent.bind(this);
      this.handleFileSelectChange = this.handleFileSelectChange.bind(this);
      this.handleOpenFromDiskButtonClick = this.handleOpenFromDiskButtonClick.bind(this);
      this.handleSaveToDiskButtonClick = this.handleSaveToDiskButtonClick.bind(this);
      this.state = {
      'content': dcrcontent,
      'editor_mode': this.props.editorMode
    };
  }

  handleSaveToDiskButtonClick(event) {
    // provide a drop down for specifying indent in tabs or 2 or 4 spaces
    const json_text = JSON.stringify(jsoneditor.get(), null, 2);
    const blob = new Blob([json_text], {type: media_blob_map.file});

    FileSaver.saveAs(blob, json_file_name);
    event.preventDefault();
  }

  handleOpenFromDiskButtonClick(event) {
    // Using the anchor tag to mask the ugly input file picker control
    const fileElem = document.getElementById(dom_selector_map.fileEl);

    if (fileElem) {
      fileElem.click();
    }

    event.preventDefault();
  }

  handleFileSelectChange(event) {
    const file = event.target.files[0];

    //if (!file.type.match('/json/')) {
    if (file) {
      json_file_name = file.name;
    } else {
      return false;
    }

    // Leverage a new Blob JavaScript object
    const r = new FileReader();
    r.onload = function(e) {
      jsoneditor.set(JSON.parse(e.target.result));
      jsoneditor.focus();
    };

    r.readAsText(file);
  }

  saveJsonContent(event) {
    const jsonTextArea = document.getElementById(dom_selector_map.json_content_field_id);
    let jsonEditorData = {}; // jsoneditor.get();

    try {
      jsonEditorData = jsoneditor.get();
    } catch(e) {
      if(e.message.search('Parse error') > -1) {
        jsoneditor.set(this.state.content);
      }

      return true;
    }

    // console.log(this);
    this.setState({'content': jsonEditorData});

    jsonTextArea.value = JSON.stringify(jsonEditorData);

    event.preventDefault();
  }

  switchJsonEditorDisplay(event) {
    event.preventDefault();

    const currentEditMode = jsoneditor.getMode();

    if (currentEditMode === json_mode.alternate) {
      jsoneditor.setMode(json_mode.default);
      this.setState({'editor_mode': json_mode.default});
    } else {
      jsoneditor.setMode(json_mode.alternate);
      this.setState({'editor_mode': json_mode.alternate});
    }
  }

  componentDidMount() {
    const jsonBody = document.getElementById(dom_selector_map.json_content_field_id);
    const jsonEditorForm = document.getElementById(dom_selector_map.json_content_edit_form_id);
    const isEditorForm = () => { return !!jsonEditorForm; };

    // hide weird extra advanced tabs thing
    document.querySelector(dom_selector_map.editAdvLabel).style['display'] = 'none';

    // create the editor
    const container = document.getElementById(dom_selector_map.jsonEditorId);
    // const options = {mode: 'code'};
    const options = {mode: this.state.editor_mode}; // default mode is 'tree'
    const editor = new JSONEditor(container, options);

    if (isEditorForm()) {
      // get the json
      let formJSON = JSON.parse(jsonBody.value);
      // set json in the jsoneditor control
      editor.set(formJSON);
      this.setState({'content': formJSON});
    } else {
      jsonBody.value = JSON.stringify(this.state.content);
      // set json in the jsoneditor control
      editor.set(this.state.content);
    }

    // We are going to hide the default submit button - for demo only
    document.getElementById(dom_selector_map.jsonBodyWrapperId).style['display'] = 'none';

    jsoneditor = editor;

    jQuery(container).resizable({ resize: function() {
      jsoneditor.setText(jsoneditor.getText());  // Workaround for glitch in resizing event in code mode
    }, minHeight: 300, minWidth: 400 });
  }

  render() {
    return (
      <div>
        <fieldset name="json-editor-tools" style={css.json_tool_bar}>
          <legend>JSON editor tools</legend>
          <div className="form-actions js-form-wrapper form-wrapper
            ButtonGroup u-cf">
            <input style={css.file_element} type="file" id="file-elem"
              onChange={this.handleFileSelectChange} />
            <button id="file-select" style={css.extended_button_styles}
              className="Button Button--link" type="button"
              onClick={this.handleOpenFromDiskButtonClick}>Open file</button>
            <button id="file-save" style={css.extended_button_styles}
              className="Button Button--link" type="button"
              onClick={this.handleSaveToDiskButtonClick}>Download file</button>
          </div>
        </fieldset>
        <div id="jsoneditor" onBlur={this.saveJsonContent}></div>
      </div>
    );
  }
}

JsonEditorComponent.defaultProps = {
	'editorMode': json_mode.default
};

ReactDOM.render(
  <JsonEditorComponent />,
  document.getElementById(dom_selector_map.app)
);
