$.fn.toEm = function(settings){
    settings = jQuery.extend({
        scope: 'body'
    }, settings);
    var that = parseInt(this[0],10),
        scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
        scopeVal = scopeTest.height();
    scopeTest.remove();
    return (that / scopeVal).toFixed(8);
};

$.fn.toPx = function(settings){
    settings = jQuery.extend({
        scope: 'body'
    }, settings);
    var that = parseFloat(this[0]),
        scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
        scopeVal = scopeTest.height();
    scopeTest.remove();
    return Math.round(that * scopeVal);
};

function Application () {
  this.$app = $("#QuestionForm");
};

Application.prototype.init = function() {
  this.questions = [
    new QuestionCard(1, "Wie viel Vorfreude aufs Alter wollen Sie sich heute leisten?"),
    new QuestionCard(2, "Wie viel Vorfreude aufs Alter wollen Sie sich heute leisten?")
  ];

  this.question_height = 0;
  for ( var i in this.questions ) {
    var q = this.questions[i];
    q.init();

    q.hide();

    this.question_height = q.getHeight();
  }

  this.current_question_id = 0;

  this.current_question = this.questions[0];
  this.current_question.show();

  this.$title = $("#QuestionTitle");

  this.onResizeListener();
  $(window).on("resize", this.onResizeListener);

  $(".pension-questions").hide();

  this.$app.height($("#QuestionIntro").outerHeight(true));
};

Application.prototype.onResizeListener = function(e) {
  this.current_question.resizeImage();
};

Application.prototype.titleStartClickListener = function (e) {
  var self = this;

  self.startTest();
}

Application.prototype.startButtonListener = function (e) {
  this.startTest();
}

Application.prototype.startTest = function() {
  var self = this;

  TweenLite.to("#TitleStartButton", 1, {opacity: 0});

  this.swapTwoCards($("#QuestionIntro"), $(".pension-questions"));

  this.changeTitle(this.current_question.title);
};

Application.prototype.plusClickListener = function (e) {
  this.current_question.plusClickListener();
}

Application.prototype.minusClickListener = function (e) {
  this.current_question.minusClickListener();
}

Application.prototype.nextQuestion = function(e) {
  if ( this.current_question_id >= this.questions.length - 1  ) {
    this.finishTest();
    return;
  }

  var q1 = this.current_question;

  this.current_question_id++;
  var q2 = this.current_question = this.questions[this.current_question_id];

  var question_id = this.current_question_id;

  $("#QuestionNumbers span").each(function(i, item) {
    if ( i == question_id ) {
      $(item).addClass("red");
    }
  });

  this.swapTwoQuestionCards(q1.$this, q2.$this);

  this.changeTitle(q2.title);
};

Application.prototype.changeTitle = function(title) {
  var $qt = $("#QuestionTitle");
  TweenLite.to($qt, 1, {opacity: 0, onComplete: function() {
    $qt.html(title);
    TweenLite.to($qt, 1, {opacity: 1});
  }});
};

Application.prototype.swapTwoCards = function(a, b, callback) {
  TweenLite.to( this.$app, 1, {height: b.outerHeight(true)} );

  $("html, body").animate({ scrollTop: $('#QuestionTitle').offset().top }, 1000);

  TweenLite.to(a, 1, {opacity: 0, onComplete: function(){
    a.hide();
    b.show();
    TweenLite.from(b, 1, {opacity: 0, onComplete: callback})
  }});
};

Application.prototype.swapTwoQuestionCards = function(a, b, callback) {

  TweenLite.to(a, 1, {opacity: 0, onComplete: function(){
    a.hide();
    b.show();
    TweenLite.from(b, 1, {opacity: 0, onComplete: callback})
  }});
};

Application.prototype.finishTest = function() {
  var self = this;

  this.initCalulator();

  this.changeTitle("So viel Vorfreude kann so wenig kosten!");

  this.swapTwoCards($(".pension-questions"), $("#Result"), function() {
      var i1 = 20 + 20 * $("#QuestionImages_1")[0].selectedIndex;
      var i2 = 20 + 20 * $("#QuestionImages_2")[0].selectedIndex;

      $(".final-logo").each(function(i, item){
        var w = 100 + 200 * i / 5;
        if ( i == 0 ) {
          w = i1 * 300 / 100;
        }
        else if ( i == 1 ) {
          w = i2 * 300 / 100;
        }

        TweenLite.to($("#"+item.id+" > span"), 1, {width: w});
      });
  });
};

Application.prototype.displayPensionCalculator = function() {
  var $calc = $(".pension-calculator");

  var height = 0;
  $calc.children().each(function(i, item) {
      height += $(item).outerHeight(true);
  });

  TweenLite.to(this.$app, 1, {height: "+=" + height, onComplete: function() {
    TweenLite.set($calc, {height: height});
    TweenLite.from($calc, 1, {opacity: 0});
  }});
};

Application.prototype.initCalulator = function() {
  this.payment_slider = $("#ResultPayment").slider({
    min: 20,
    max: 500,
    animate: true,
    range: "min",
    value: 25,
    slide: this.updateCalculatorResutl.bind(this)
  });

  this.year_slider = $("#ResultWorkYears").slider({
    min: 18,
    max: 65,
    animate: true,
    range: "min",
    value: 25,
    slide: this.updateCalculatorResutl.bind(this)
  });
};

Application.prototype.updateCalculatorResutl = function() {
  var payment = this.payment_slider.slider("value");
  var year = this.year_slider.slider("value");
  var result = payment * year;

  // <input id="ResultPension" type="text" value="1.500 Euro" />
  $("#ResultPension").val( result + " Euro");
};



function QuestionCard ( question_number, question_title ) {
  this.num = question_number;
  this.title = question_title;

  this.is_transition = false;

  this.$this = $("#Question_" + this.num);

  this.$ = function(query) {
    return this.$this.find(query);
  }
};

QuestionCard.prototype.init = function() {
  var self = this;

  this.question_height_minus_image_height =
    this.$(".question-description").outerHeight(true)
    + this.$(".pension-controlls").outerHeight(true)
    + this.$("h2").outerHeight(true)
    + $(".pagination-centered").outerHeight(true)
    + $("#QuestionTitle").outerHeight(true)
    + $(".weiter-block").outerHeight(true)
    + $(2*2 + 4).toPx();

    console.log(this.$(".question-description").outerHeight(true)
    , this.$(".pension-controlls").outerHeight(true)
    , this.$("h2").outerHeight(true)
    , $(".pagination-centered").outerHeight(true)
    , $("#QuestionTitle").outerHeight(true)
    , $(".weiter-block").outerHeight(true)
    , $(2*2 + 4).toPx());

  this.$(".answer-images .pension-image").each(function(index, item){
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
    animate: true,
    range: "min",
    value: this.select[ 0 ].selectedIndex + 1,
    start: function( event, ui ) {
      self.hideImage(ui.value);
    },
    stop: function( event, ui ) {
      self.showImage(ui.value);
    },
    change: function( event, ui ) {
      self.select[ 0 ].selectedIndex = ui.value - 1;
    }
  });

  this.$( ".minbeds" ).change(function() {
    self.slider.slider( "value", this.selectedIndex + 1 );
  });

  this.resizeImage();
};

QuestionCard.prototype.getHeight = function() {
  return this.$this.height();
};

QuestionCard.prototype.show = function() {
  this.$this.show();
};

QuestionCard.prototype.hide = function() {
  this.$this.hide();
};

QuestionCard.prototype.enter = function() {
  this.show();
  TweenLite.from(this.$this, 1, {opacity: 0});
};

QuestionCard.prototype.leave = function() {
  TweenLite.to(this.$this, 1, {opacity: 0, x: "-100%", onComplete: this.hide.bind(this)});
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

QuestionCard.prototype.resizeImage = function() {
  this.$(".answer-images").height(window.innerHeight - this.question_height_minus_image_height);
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