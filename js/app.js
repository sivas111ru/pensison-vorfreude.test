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

  this.user_age = 28;
};

Application.prototype.getPensionFromSavedMoneyPerYear = function(saved_money_per_year) {
  
};

Application.prototype.init = function() {
  var self = this;

  this.questions = [
    new QuestionCard(this, 1, "Wie viel Vorfreude aufs Alter wollen Sie sich heute leisten?"),
    new QuestionCard(this, 2, "Wie viel Vorfreude aufs Alter wollen Sie sich heute leisten?"),
    new QuestionCard(this, 3, "Wie viel Vorfreude aufs Alter wollen Sie sich heute leisten?")
  ];

  this.answers = [1,1,1];

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

  this.question_age_card = new QuestionAgeCard(this);

  this.onResizeListener();
  $(window).on("resize", this.onResizeListener);

  $(".pension-questions").hide();

  this.$app.height($("#QuestionIntro").outerHeight(true));

  this.result_card = new ResultCard(this);
};

Application.prototype.onResizeListener = function(e) {
  this.current_question.resizeImage();
};

Application.prototype.gotoAgeButtonQuestionListener = function(e) {
  this.swapTwoCards($("#QuestionIntro"), this.question_age_card.$this);

  this.changeTitle("Wie viel Vorfreude aufs Alter wollen Sie sich heute leisten?");
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

  this.swapTwoCards($("#QuestionAge"), $(".pension-questions"));

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

Application.prototype.calculateImaginaryPension = function() {
  var imag_pension = 0;
  var MAX_PENSION = 1000;
  var QUESTIONS_COUNT = 3;
  var QUESTION_OPTIONS_COUNT = 5;

  this.answers.map(function(num) {
    imag_pension += num / QUESTION_OPTIONS_COUNT;
  });

  imag_pension = imag_pension / QUESTIONS_COUNT * MAX_PENSION;

  this.imaginary_pension = imag_pension;
};

Application.prototype.calculateSavings = function() {
  var p = this.imaginary_pension;
  var p_a = Application.PENSION_DATA_ARRAY[this.user_age];

  var savings = 0;

  if ( p < 400 ) {
    savings = p_a[0] + p_a[1] * ( p - 200 ) / 200;
  }
  else if ( p < 600 ) {
    savings = p_a[1] + p_a[2] * ( p - 400 ) / 200;
  }
  else if ( p < 800 ) {
    savings = p_a[2] + p_a[3] * ( p - 600 ) / 200;
  }
  else if ( p < 1000 ) {
    savings = p_a[3] + p_a[4] * ( p - 800 ) / 200;
  }

  return savings;
};

Application.prototype.finishTest = function() {
  var self = this;

  this.changeTitle(this.result_card.title);

  this.swapTwoCards($(".pension-questions"), this.result_card.$this, function() {
    self.calculateImaginaryPension();

    TweenLite.set($("#PensionPrice"), {"opacity": 0});

    self.result_card.init();

    $("#PensionPrice").text( Math.round(self.imaginary_pension * 100 ) / 100 + " Euro*");
    TweenLite.to($("#PensionPrice"), 0.3, {"opacity": 1});
  });
};

Application.prototype.displayPensionCalculator = function() {
  this.result_card.displayPensionCalculator();
};



/* QEUSTION AGE CARD */

function QuestionAgeCard( app ) {
  this.app = app;

  this.age_slider = $("#UserAge").slider({
    min: 18,
    max: 67,
    animate: true,
    range: "min",
    value: app.user_age,
    slide: function(event, ui) {
      app.user_age = ui.value;
      $("#UserAge .ui-handle-text").text(ui.value + " Jahre");
    }
  });
  $("#UserAge .ui-slider-handle").append("<span class='ui-handle-text'>" + app.user_age + " Jahre</span>");

  this.$this = $("#QuestionAge");
  this.$this.hide();
};

QuestionAgeCard.prototype.show = function() {
  this.$this.show();
};

/* QUESTION CARD */

function QuestionCard ( app, question_number, question_title ) {
  this.app = app;
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

  var prev_value = 1;

  this.slider = this.$( ".pension-controlls .pension-slider" ).slider({
    min: 1,
    max: 5,
    animate: false,
    range: "min",
    value: 1,
    start: function( event, ui ) {
      prev_value = ui.value;
    },
    stop: function( event, ui ) {
      self.swapImages(prev_value, ui.value);
    },
    change: function( event, ui ) {
      self.app.answers[ self.num - 1 ] = ui.value;
    }
  });

  this.$( ".minbeds" ).change(function() {
    self.slider.slider( "value", this.selectedIndex + 1 );
  });

  this.resizeImage();
};

QuestionCard.prototype.swapImages = function(img_from_index, img_to_index) {
  this.$("#Img_" + this.num + "_" + img_from_index).fadeOut();
  this.$("#Img_" + this.num + "_" + img_to_index).fadeIn();
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
  this.swapImages(value-1, value);
};

QuestionCard.prototype.minusClickListener = function() {
  var $s = this.$(".pension-slider");
  var value = $s.slider( "option", "value" ) - 1;

  if ( value <= 0 ) {
    return false;
  }

  $s.slider( "value", value );

  this.swapImages(value, value+1);
};


/* FINISH CARD */

function ResultCard(app) {
  this.app = app;

  this.createSliders();

  this.title = "So viel Vorfreude kann so wenig kosten!";

  this.$this = $("#Result");
}

ResultCard.prototype.createSliders = function() {
  var self = this;

  this.sliders = [];

  this.app.answers.map(function(num, index) {
    var i = index + 1;
    self.sliders.push(
        $("#FinalPageSlider" + i).slider({
          min: 1,
          max: 5,
          animate: false,
          range: "min",
          value: num,
          change: function( event, ui ) {
            self.app.answers[index] = ui.value;

            TweenLite.to($("#PensionPrice"), 0.4, {"opacity": 0, onComplete: function() {
              $("#PensionPrice").text( Math.round(self.app.imaginary_pension * 100 ) / 100 + " Euro*");

              TweenLite.to($("#PensionPrice"), 0.4, {"opacity": 1});
            }});

            self.app.calculateImaginaryPension();

            TweenLite.to( $("#FinalSliderImages" + i), 1, {x: -279.91 * (ui.value - 1)});
          }
        })
      );
  });
};

ResultCard.prototype.init = function() {
  var self = this;

  this.initCalulator();

  this.sliders.map(function(item, index) {
    item.slider("value", self.app.answers[index]);
  });
};

ResultCard.prototype.initCalulator = function() {
  var self = this;

  var p = this.app.imaginary_pension;
  var savings = this.app.calculateSavings();

  $("#ResultPension").val(Math.round(p / 10) * 10 + " Euro");

  this.payment_slider = $("#ResultPayment").slider({
    min: 20,
    max: 500,
    step: 0.01,
    animate: true,
    range: "min",
    value: savings,
    slide: function (e, ui) {
      $("#ResultPayment .value").text(ui.value);
      self.updateCalculatorResult();
    }
  });

  this.year_slider = $("#ResultWorkYears").slider({
    min: 18,
    max: 55,
    animate: true,
    range: "min",
    value: self.app.user_age,
    slide: function(e, ui) {
      self.app.user_age = ui.value;

      $("#ResultWorkYears .value").text(ui.value);

      var pens_array = Application.PENSION_DATA_ARRAY[ui.value];
      var min = pens_array[0];
      var max = pens_array[4];

      self.payment_slider.slider("option", "min", min);
      $("#ResultPayment .min").text(min);

      self.payment_slider.slider("option", "max", max);
      $("#ResultPayment .max").text(max);

      self.updateCalculatorResult();
    }
  });
};

ResultCard.prototype.displayPensionCalculator = function() {
  var $calc = $(".pension-calculator");

  var p = this.app.imaginary_pension;

  var savings = this.app.calculateSavings();

  var p_a = Application.PENSION_DATA_ARRAY[this.app.user_age];

  var min = p_a[0];
  var max = p_a[4];

  $("#ResultPension").val( Math.round(p / 10) * 10 + " Euro");

  $("#ResultPayment .min").text(min);
  this.payment_slider.slider("option", "min", min);

  $("#ResultPayment .max").text(max);
  this.payment_slider.slider("option", "max", max);

  this.payment_slider.slider("value", savings);
  $("#ResultPayment .value").text( Math.round(savings * 100) / 100);

  var height = 0;
  $calc.children().each(function(i, item) {
      height += $(item).outerHeight(true);
  });

  TweenLite.to(this.app.$app, 1, {height: "+=" + height, onComplete: function() {
    TweenLite.set($calc, {height: height});
    TweenLite.from($calc, 1, {opacity: 0});
  }});
};

ResultCard.prototype.updateCalculatorResult = function() {
  var PENSIONS = [200, 400, 600, 800, 1000];
  var payment = this.payment_slider.slider("value");
  var year = this.app.user_age;

  var pens_array = Application.PENSION_DATA_ARRAY[year];

  for ( var i=0; i < pens_array.length; i++ ) {
    if ( payment < pens_array[i] ) {
      break;
    }
  }

  if ( i == 0 || i >= pens_array.length  ) {
    console.log("ERROR!");
    return;
  }

  var norm = (PENSIONS[i] - PENSIONS[i-1]) / (pens_array[i] - pens_array[i-1]);
  var result = PENSIONS[i] - (pens_array[i] - payment) * norm;

  console.log(i, payment, year, result, norm, (pens_array[i] - payment) * norm);

  $("#ResultPension").val( Math.round(result / 10) * 10 + " Euro");
};

$(function() {

  window.app = new Application();
  app.init();
});

var pens_array = [];
pens_array[18] = [27.07, 51.86, 76.65, 101.42, 126.23];
pens_array[19] = [28.41, 54.54, 80.67, 106.79, 132.92];
pens_array[20] = [29.83, 57.37, 136.59, 112.46, 140.01];
pens_array[21] = [31.34, 60.39, 129.52, 118.47, 147.53];
pens_array[22] = [32.93, 63.56, 122.83, 124.82, 155.46];
pens_array[23] = [34.62, 66.94, 116.39, 131.59, 163.92];
pens_array[24] = [36.41, 70.52, 110.32, 138.73, 172.86];
pens_array[25] = [38.3, 74.31, 104.63, 146.33, 182.35];
pens_array[26] = [40.32, 78.36, 99.27, 154.41, 192.44];
pens_array[27] = [42.47, 82.65, 94.2, 163.01, 203.19];
pens_array[28] = [42.47, 87.1, 89.42, 171.92, 214.32];
pens_array[29] = [42.47, 91.81, 84.92, 181.35, 226.11];
pens_array[30] = [42.47, 96.88, 80.67, 191.46, 238.74];
pens_array[31] = [52.26, 102.24, 76.65, 202.19, 252.16];
pens_array[32] = [55.12, 107.97, 160.8, 213.64, 266.48];
pens_array[33] = [58.19, 114.08, 169.99, 225.91, 281.8];
pens_array[34] = [61.46, 120.65, 179.83, 239.03, 298.21];
pens_array[35] = [64.96, 127.65, 190.34, 253.03, 315.72];
pens_array[36] = [68.73, 135.21, 201.68, 268.14, 334.61];
pens_array[37] = [72.79, 143.3, 213.81, 284.32, 354.85];
pens_array[38] = [77.14, 152.02, 226.9, 301.77, 376.65];
pens_array[39] = [81.86, 161.43, 241.03, 320.62, 400.21];
pens_array[40] = [86.95, 171.63, 256.31, 341.01, 425.69];
pens_array[41] = [92.45, 182.64, 272.84, 363.03, 453.22];
pens_array[42] = [98.46, 194.66, 290.88, 387.07, 483.28];
pens_array[43] = [4.99, 207.73, 310.45, 413.19, 515.93];
pens_array[44] = [12.13, 222.01, 331.89, 441.76, 551.63];
pens_array[45] = [19.97, 237.68, 355.39, 473.1, 590.82];
pens_array[46] = [28.57, 254.88, 381.19, 507.52, 633.82];
pens_array[47] = [38.1, 273.97, 409.82, 545.69, 681.54];
pens_array[48] = [48.67, 295.09, 441.52, 587.95, 734.37];
pens_array[49] = [60.46, 318.68, 476.9, 635.11, 793.33];
pens_array[50] = [73.65, 345.07, 516.48, 687.9, 859.31];
pens_array[51] = [88.61, 374.97, 561.33, 747.7, 934.05];
pens_array[52] = [25.56, 408.89, 612.21, 815.53, 1018.85];
pens_array[53] = [25.01, 447.77, 670.54, 893.31, 1116.07];
pens_array[54] = [47.52, 492.79, 738.06, 983.35, 1228.63];
pens_array[55] = [73.78, 545.33, 816.89, 1088.44, 1359.99];
Application.PENSION_DATA_ARRAY = pens_array;