// Budget Controller

var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    items: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.items[type].forEach(function (current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  };

  return {
    addItem: function (type, description, value) {
      var newItem;
      var id = data.items[type].length + 1;

      if (type === "exp") {
        newItem = new Expense(id, description, value);
      } else if (type === "inc") {
        newItem = new Income(id, description, value);
      }

      data.items[type].push(newItem);

      return newItem;
    },
    calculateBudget: function () {
      // Calculate total incomes and expenses
      calculateTotal("inc");
      calculateTotal("exp");
      // Calculate the budget: incomes - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentage: function () {
      data.items.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      var percentages = data.items.exp.map(function (current) {
        return current.getPercentage();
      });

      return percentages;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    deleteItem: function (type, id) {
      var ids, index;

      ids = data.items[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.items[type].splice(index, 1);
      }
    },
  };
})();

// UI Controller

var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomesLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    num = Number(num).toLocaleString("en", options);

    var sign = type === "exp" ? (sign = "-") : (sign = "+");

    return sign + " " + num;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getDOMStrings: function () {
      return DOMStrings;
    },
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },
    addListItem: function (type, obj) {
      var html, newHtml, container;
      if (type === "exp") {
        container = DOMStrings.expenseContainer;
        html =
          "<div class='item clearfix' id=exp-%id%>" +
          "<div class='item__description'>%description%</div>" +
          "<div class='right clearfix'>" +
          "<div class='item__value'>%value%</div>" +
          "<div class='item__percentage'>21%</div>" +
          "<div class='item__delete'>" +
          "<button class='item__delete--btn'>" +
          "<i class='ion-ios-close-outline'></i></button></div></div></div>";
      } else if (type === "inc") {
        container = DOMStrings.incomeContainer;
        html =
          "<div class='item clearfix' id=inc-%id%>" +
          "<div class='item__description'>%description%</div>" +
          "<div class='right clearfix'>" +
          "<div class='item__value'>%value%</div>" +
          "<div class='item__delete'>" +
          "<button class='item__delete--btn'>" +
          "<i class='ion-ios-close-outline'></i></button></div></div></div>";
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document
        .querySelector(container)
        .insertAdjacentHTML("beforeend", newHtml);
    },
    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },
    displayBudget: function (obj) {
      var budgetType;
      obj.budget > 0 ? (budgetType = "inc") : (budgetType = "exp");

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        budgetType
      );
      document.querySelector(
        DOMStrings.incomesLabel
      ).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },
    displayPercetanges: function (percentages) {
      var fields;
      fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    deleteListItem: function (elementId) {
      var element = document.getElementById(elementId);
      element.parentNode.removeChild(element);
    },
    displayMonth: function () {
      var now, months, month, year;

      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changedType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          ", " +
          DOMStrings.inputDescription +
          ", " +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function (curr) {
        curr.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },
  };
})();

// Global App Controller

var controller = (function (budgetCtrl, UICtrl) {
  var setUpEventListeners = function () {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var ctrlAddItem = function () {
    // Get the field input data
    var input = UICtrl.getInput();

    if (
      input.description.trim() != "" &&
      !isNaN(input.value) &&
      input.value > 0
    ) {
      // Add the item to the budget controller
      var newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      // Add the item to the UI
      UICtrl.addListItem(input.type, newItem);
      UICtrl.clearFields();

      // Calculate and Update budget
      updateBudget();

      // Calculate and Update percentage
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function (event) {
    var elementId, splitId, type, id;
    elementId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (elementId) {
      // inc-1
      splitId = elementId.split("-");
      type = splitId[0];
      id = parseInt(splitId[1]);

      // Delete the item from the data structure
      budgetCtrl.deleteItem(type, id);
      // Delete the item from the UI
      UICtrl.deleteListItem(elementId);
      // Update and show the new budget
      updateBudget();
      // Calculate and Update percentage
      updatePercentage();
    }
  };

  var updateBudget = function () {
    // Calculate the budget
    budgetCtrl.calculateBudget();
    // Return the budget
    var budget = budgetCtrl.getBudget();
    // Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function () {
    // Calculate percentages
    budgetCtrl.calculatePercentage();
    // Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // Update the UI with the new percentages
    UICtrl.displayPercetanges(percentages);
  };

  return {
    init: function () {
      console.log("Application has started");
      setUpEventListeners();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
    },
  };
})(budgetController, UIController);

controller.init();
