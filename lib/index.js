const fs = require('fs');
const path = require('path');

const jsdom = require('jsdom');
const { Domain } = require('domain');
const { JSDOM } = jsdom;

let quillFilePath = require.resolve('quill');
let quillMinFilePath = quillFilePath.replace('quill.js', 'quill.min.js');
let quillStylePath = quillFilePath.replace('quill.js', 'quill.core.css');

let quillLibrary = fs.readFileSync(quillMinFilePath);
let mutationObserverPolyfill = fs.readFileSync(path.join(__dirname, 'polyfill.js'));
let quillStylesheet = fs.readFileSync(quillStylePath);
let extendedStyles = fs.readFileSync(__dirname + '/editorfonts.css');

const JSDOM_TEMPLATE = `
  <div id="editor"></div>
  <script>${mutationObserverPolyfill}</script>
  <script>${quillLibrary}</script>
  <style>${quillStylesheet}</style>
  <style>${extendedStyles}</style>
  <script>

    let Font = Quill.import('formats/font');
    Font.whitelist.push('times-new-roman', 'arial', 'courier-new', 'georgia', 'trebuchet-ms', 'verdana', 'roboto', 'oswald', 'raleway', 'cormorant', 'saira', 'jura', 'overpass', 'fredoka', 'hahmlet');
    Quill.register(Font, true);

  	var BlockEmbed = Quill.import("blots/block/embed");

	class AudioBlot extends BlockEmbed {
    	static create(url) {
      	let node = super.create();
      	node.setAttribute('src', url);
      // Set non-format related attributes with static values
      node.setAttribute('frameborder', '0');
      node.setAttribute('allowfullscreen', false);
      node.setAttribute('controls', true);
  
      return node;
    }
  
    static formats(node) {
      // We still need to report unregistered embed formats
      let format = {};
      if (node.hasAttribute('height')) {
	format.height = node.getAttribute('height');
      }
      if (node.hasAttribute('width')) {
	format.width = node.getAttribute('width');
      }
      return format;
    }
  
    static value(node) {
      return node.getAttribute('src');
    }
  
    format(name, value) {
      // Handle unregistered embed formats
      if (name === 'height' || name === 'width') {
	if (value) {
	  this.domNode.setAttribute(name, value);
	} else {
	  this.domNode.removeAttribute(name, value);
	}
      } else {
	super.format(name, value);
      }
    }
  }

AudioBlot.blotName = 'audio';
AudioBlot.tagName = 'audio';

Quill.register(AudioBlot);

class VideoBlot extends BlockEmbed {
    	static create(url) {
      	let node = super.create();
      	node.setAttribute('src', url);
      // Set non-format related attributes with static values
      node.setAttribute('frameborder', '0');
      node.setAttribute('allowfullscreen', false);
      node.setAttribute('controls', true);
  
      return node;
    }
  
    static formats(node) {
      // We still need to report unregistered embed formats
      let format = {};
      if (node.hasAttribute('height')) {
	format.height = node.getAttribute('height');
      }
      if (node.hasAttribute('width')) {
	format.width = node.getAttribute('width');
      }
      return format;
    }
  
    static value(node) {
      return node.getAttribute('src');
    }
  
    format(name, value) {
      // Handle unregistered embed formats
      if (name === 'height' || name === 'width') {
	if (value) {
	  this.domNode.setAttribute(name, value);
	} else {
	  this.domNode.removeAttribute(name, value);
	}
      } else {
	super.format(name, value);
      }
    }
  }

VideoBlot.blotName = 'video';
VideoBlot.tagName = 'video';

Quill.register(VideoBlot);

const Embed = Quill.import("blots/embed");

class StudezyItemBlot extends Embed {

    static create(iconLink) {
      console.log(iconLink);
        let node = super.create();

        var icon = document.createElement("img");
        icon.src = "/res/img/" + iconLink + ".svg";
        icon.className = "editor_item_icon";
        node.appendChild(icon);

        node.className = "studezy_media_item";

        return node;
    }

    static formats(node) {
        // We still need to report unregistered embed formats
        let format = {};
        if (node.hasAttribute('height')) {
          format.height = node.getAttribute('height');
        }
        if (node.hasAttribute('width')) {
          format.width = node.getAttribute('width');
        }
        return format;
      }

      format(name, value) {
        // Handle unregistered embed formats
        if (name === 'height' || name === 'width') {
          if (value) {
            this.domNode.setAttribute(name, value);
          } else {
            this.domNode.removeAttribute(name, value);
          }
        } else {
          super.format(name, value);
        }
      }
}

class SurveyBlot extends StudezyItemBlot {

  surveyID;

    static create(surveyID) {

        let node = super.create("survey");

        node.className += " ql-survey";
        node.contentEditable = false;

        var title = document.createElement("h3");
        var description = document.createElement("div");
        var user = document.createElement("div");

        this.surveyID = surveyID;

        var a = document.createElement("a");
        a.href = "/surveys/view?i=" + surveyID;
        a.appendChild(title);
  
        node.appendChild(a);
        node.appendChild(description);
        node.appendChild(user);

        getSurveyMetaData(surveyID).then(data => {
          title.innerHTML = data["title"];
          description.innerHTML = data['description'];
          user.innerHTML = "By " + data['owner'];
        });

        return node;
    }

    static value() {
        return this.surveyID;
    }

}

SurveyBlot.tagName = 'div';
SurveyBlot.blotName = 'survey';

Quill.register(SurveyBlot);

class AssignmentBlot extends StudezyItemBlot {

  assignmentID;

  static create(assignmentID) {

      let node = super.create("assignment");

      node.className += " ql-assignment";

      var title = document.createElement("h3");
      var description = document.createElement("div");
      var user = document.createElement("div");

      getAssignmentMetaData(assignmentID).then(data => {
        title.innerHTML = data['title'];
        description.innerHTML = data['description'];
      });

      this.assignmentID = assignmentID;
      
      var a = document.createElement("a");
      a.href = "/assignments/view?i=" + assignmentID;
      a.appendChild(title);

      node.appendChild(a);
      node.appendChild(description);
      node.appendChild(user);

      return node;
  }

  static value() {
      return this.assignmentID;
  }
}

AssignmentBlot.tagName = 'div';
AssignmentBlot.blotName = 'assignment';

Quill.register(AssignmentBlot);


class AnnouncementBlot extends StudezyItemBlot {

  announcementID;

  static create(announcementID) {

      let node = super.create("announcement");

      node.className += " ql-announcement";
      node.contentEditable = false;

      var title = document.createElement("h3");
      var content = document.createElement("div");
      var user = document.createElement("div");

      getAnnouncementMetaData(announcementID).then(data => {
        title.innerHTML = data['title'];
        content.innerHTML = data['content'];
        user.innerHTML = "By " + data['owner'];
      });

      this.announcementID = announcementID;
      
      var a = document.createElement("a");
      a.href = "/announcements/view?i=" + announcementID;
      a.appendChild(title);

      node.appendChild(a);
      node.appendChild(content);
      node.appendChild(user);

      return node;
  }

  static value() {
      return this.announcementID;
  }

}

AnnouncementBlot.tagName = 'div';
AnnouncementBlot.blotName = 'announcement';

Quill.register(AnnouncementBlot);

class ChatBlot extends StudezyItemBlot {
  chatID;

  static create(chatID) {
      let node = super.create("chat");

      this.chatID = chatID;

      var title = document.createElement("h3");
      var memberCount = document.createElement("div");
      
      getChatMetaData(chatID).then(data => {
        title.innerHTML = data['name'];
        memberCount.innerHTML = data['memberCount'].toString() + " members";
      });

      var a = document.createElement("a");
      a.href = "/messages/chat?i=" + chatID;
      a.appendChild(title);

      node.appendChild(a);
      node.appendChild(memberCount);

      return node;
  }

  static value() {
      return this.chatID;
  }
}

ChatBlot.tagName = 'div';
ChatBlot.blotName = 'chat';

Quill.register(ChatBlot);
  </script>
  <script>
    document.getSelection = function() {
      return {
        getRangeAt: function() { }
      };
    };
    document.execCommand = function (command, showUI, value) {
      try {
          return document.execCommand(command, showUI, value);
      } catch(e) {}
      return false;
    };
  </script>
`;

const JSDOM_OPTIONS = { runScripts: 'dangerously', resources: 'usable' };
const DOM = new JSDOM(JSDOM_TEMPLATE, JSDOM_OPTIONS);

const cache = {};

const mysql = require("mysql2");

const MysqlConnection = mysql.createConnection({
  host:"localhost",
  user:"noel",
  password:"Daesilo.1881",
  database : "flashcards"
});

exports.convertTextToDelta = (text) => {
  if (!cache.quill) {
    cache.quill = new DOM.window.Quill('#editor');
  }

  cache.quill.setText(text);

  let delta = cache.quill.getContents();
  return delta;
};

exports.convertHtmlToDelta = (html) => {
  if (!cache.quill) {
    cache.quill = new DOM.window.Quill('#editor');
  }

  let delta = cache.quill.clipboard.convert(html);

  return delta;
};

exports.convertDeltaToHtml = (delta) => {
  return new Promise((resolve, reject) => {

  // Add fetching functions for information required to render studezy media elements correctly (with information), emulates the API
    DOM.window.getSurveyMetaData = surveyID => {
      var p = new Promise((resolve, reject) => {
        // QUERY NEEDS OPTIMIZATION
        MysqlConnection.query("SELECT title, description, (SELECT uname FROM users WHERE uid=(SELECT owner FROM surveys WHERE id=?)) AS `owner` FROM surveys WHERE id=?",  [surveyID, surveyID], (err, res) => {
          if(err === null) {
            resolve(res[0]); 
          } else console.log(err);
        });
      });
      return p;
    }

    DOM.window.getAssignmentMetaData = assignmentID => {
      return new Promise((resolve, reject) => {
        // QUERY NEEDS OPTIMIZATION
        MysqlConnection.query("SELECT title, description, (SELECT uname FROM users WHERE uid=(SELECT owner FROM assignments WHERE id=?)) AS `owner` FROM assignments WHERE id=?",  [assignmentID, assignmentID], (err, res) => {
          if(err === null) {
            resolve(res[0]); 
          } else console.log(err);
        });
      });
    }

    DOM.window.getAnnouncementMetaData = announcementID => {
      return new Promise((resolve, reject) => {
        // QUERY NEEDS OPTIMIZATION
        MysqlConnection.query("SELECT title, content, (SELECT uname FROM users WHERE uid=(SELECT user FROM announcements WHERE id=?)) AS `owner` FROM announcements WHERE id=?",  [announcementID, announcementID], (err, res) => {
          if(err === null) {
            resolve(res[0]); 
          } else console.log(err);
        });
      });
    }

    DOM.window.getChatMetaData = chatID => {
      return new Promise((resolve, reject) => {
        // QUERY NEEDS OPTIMIZATION
        MysqlConnection.query("SELECT name, (SELECT COUNT(*) FROM chat_memberships WHERE chat_id=?) AS `memberCount` FROM chats WHERE chat_id=?",  [chatID, chatID], (err, res) => {
          if(err === null) {
            resolve(res[0]); 
          } else console.log(err);
        });
      });
    }
    
    if (!cache.quill) {
      cache.quill = new DOM.window.Quill('#editor');
    }

    cache.quill.setContents(delta);

    // THIS IS A FIX AND SHOULD BE CHANGED!!! (Makes sure information about custom StudEzy objects have been fetched succesfully before resolving)
    setTimeout(() => resolve(cache.quill.root.innerHTML), 500);

  });
  
};
