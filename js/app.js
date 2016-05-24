function Application () {

};

Application.prototype.init = function() {
  this.questions = [
    new QuestionCard(1)
  ];

  this.question_height = 0;
  for ( var i in this.questions ) {
    var q = this.questions[i];
    q.init();

    this.question_height = q.getHeight();

    q.hide();
  }

  this.current_question_id = 0;

  this.current_question = this.questions[0];

  this.$title = $("#QuestionTitle");

  this.onResizeListener();
  $(window).on("resize", this.onResizeListener);

  $("#QuestionNumbers").hide();
};

Application.prototype.onResizeListener = function(e) {
  var q = this.current_question;
  q.resizeImageContainer();
};

Application.prototype.titleStartClickListener = function (e) {
  var self = this;

  self.startTest();

  $("#TitleStartButton").css("position", "absolute");

  $("#TitleStartButton").animate({height: 0, opacity: 0}, 1000);
}

Application.prototype.startTest = function() {
  var self = this;

  $("#QuestionIntro").fadeOut();

  this.current_question.$this
    .css("display", "block")
    .css("opacity", 0)
    .animate({height: this.question_height}, 1000, function() {
      $("#QuestionNumbers").fadeIn();
      self.current_question.show();
      $("html, body").animate({ scrollTop: $('#QuestionTitle').offset().top }, 1000);
    });
};

Application.prototype.startButtonListener = function (e) {
  alert("start");
  // @TODO: animation of container to fit the question
    // @TODO: animation of apearing question
}

Application.prototype.plusClickListener = function (e) {
  this.current_question.plusClickListener();
}

Application.prototype.minusClickListener = function (e) {
  this.current_question.minusClickListener();
}

Application.prototype.nextClickListener = function(e) {
  console.log("next!");
};



function QuestionCard ( question_number ) {
  this.num = question_number;

  this.is_transition = false;

  this.$ = function(query) {
    return this.$this.find(query);
  }
};

QuestionCard.prototype.init = function() {
  var self = this;

  this.$this = $("#Question_" + this.num);

  this.$(".answer-images img").each(function(index, item){
    var $item = $(item);
    $item.css("z-index", index);
    if ( index > 0 ) {
      $item.css("display", "none");
    }
  });

  this.select = this.$(".minbeads");
  this.slider = this.$( ".pension-controlls .pension-slider" ).slider({
    min: 1,
    max: 5,
    range: "min",
    value: this.select[ 0 ].selectedIndex + 1,
    start: function( event, ui ) {
      self.hideImage(ui.value);
    },
    stop: function( event, ui ) {
      self.showImage(ui.value);
    },
    slide: function( event, ui ) {
      self.select[ 0 ].selectedIndex = ui.value - 1;
    }
  });

  this.$( ".minbeds" ).change(function() {
    self.slider.slider( "value", this.selectedIndex + 1 );
  });
};

QuestionCard.prototype.resizeImageContainer = function() {
  this.$(".answer-images").height(this.$(".answer-images img").height());
};

QuestionCard.prototype.getHeight = function() {
  return this.$this.height();
};

QuestionCard.prototype.show = function() {
  this.$this.animate({opacity: 1});
  this.resizeImageContainer();
};

QuestionCard.prototype.hide = function() {
  this.$this.hide();
};

QuestionCard.prototype.hideImage = function(image_number, callback) {
  var self = this;

  this.$("#Img_" + this.num + "_" + image_number).fadeOut(function() {
    if ( callback ) {
      callback();
    }
  });
};

QuestionCard.prototype.showImage = function(image_number, callback) {
  var self = this;

  this.$("#Img_" + this.num + "_" + image_number).fadeIn(function() {
    if ( callback ) {
      callback();
    }
  });
};

QuestionCard.prototype.plusClickListener = function() {
  var $s = this.$(".pension-slider");
  var value = $s.slider( "option", "value" ) + 1;

  if ( value > $s.slider("option", "max") ) {
    return false;
  }

  $s.slider( "value", value );

  if ( !this.is_transition ) {
    this.is_transition = true;

    var self = this;

    this.hideImage(value - 1, function() {
      self.is_transition = false;
      self.showImage(value);
    });
  }
};

QuestionCard.prototype.minusClickListener = function() {
  var $s = this.$(".pension-slider");
  var value = $s.slider( "option", "value" ) - 1;

  if ( value <= 0 ) {
    return false;
  }

  $s.slider( "value", value );

  if ( !this.is_transition ) {
    this.is_transition = true;

    var self = this;

    this.hideImage(value + 1, function() {
      self.is_transition = false;
      self.showImage(value);
    });
  }
};

$(function() {

  window.app = new Application();
  app.init();
});