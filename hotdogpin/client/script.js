// A reference to Stripe.js
var stripe;

var orderData = {
  items: [{ id: "hotdogpin" }],
  currency: "usd"
};

// // Disable the button until we have Stripe set up on the page
//document.querySelector("button").disabled = true;

fetch("/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(orderData)
})
  .then(function(result) {
    return result.json();
  })
  .then(function(data) {
    return setupElements(data);
  })
  .then(function({ stripe, card, clientSecret }) {
    document.querySelector("#submit").addEventListener("click", function(evt) {
      evt.preventDefault();
      // Initiate payment
      pay(stripe, card, clientSecret);


    //document.querySelector("button").disabled = false;

    // Handle form submission.
    // var form = document.getElementById("payment-form");
    // form.addEventListener("submit", function(event) {
    //   event.preventDefault();
    //   // Initiate payment when the submit button is clicked
    //   pay(stripe, card, clientSecret);
    });
  });

// Set up Stripe.js and Elements to use in checkout form
var setupElements = function(data) {
  stripe = Stripe(data.publishableKey);
  var elements = stripe.elements();
  var style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  };

  var card = elements.create("card", { style: style });
  card.mount("#card-element");

  return {
    stripe: stripe,
    card: card,
    clientSecret: data.clientSecret
  };
};

/*
 * Calls stripe.confirmCardPayment which creates a pop-up modal to
 * prompt the user to enter extra authentication details without leaving your page
 */
var pay = function(stripe, card, clientSecret) {
  changeLoadingState(true);
  var cardholderName = document.querySelector("#name").value,
    postalCode = document.querySelector("#postal-code").value,
    shipAddress = document.querySelector("#address").value,
    shipCity = document.querySelector("#city").value,
    shipState = document.querySelector("#state").value;

  var data = {
    card: card,
    billing_details: {}
  };

  var shipping_data = {address: {}};

  if (cardholderName) {
    data["billing_details"]["name"] = cardholderName;
    shipping_data["name"]=cardholderName;
  }
  if (postalCode) {
    data["billing_details"]["address"] = { postal_code: postalCode};
    shipping_data["address"]["postal_code"]=postalCode;
  }

  if (shipAddress) {
    shipping_data["address"]["line1"] = shipAddress;
  }

  if(shipCity){
    shipping_data["address"]["city"]=shipCity;
  }

  if(shipState){
    shipping_data["address"]["state"]=shipState;
  }  

  // Initiate the payment.
  // If authentication is required, confirmCardPayment will automatically display a modal
  stripe
    .confirmCardPayment(clientSecret, { payment_method: data, shipping: shipping_data})
    .then(function(result) {
      if (result.error) {
        // The card was declined (i.e. insufficient funds, card has expired, etc)
        changeLoadingState(false);
        var errorMsg = document.querySelector(".sr-field-error");
        errorMsg.textContent = result.error.message;
        setTimeout(function() {
          errorMsg.textContent = "";
        }, 4000);
      } else {
        // The payment has been processed!
        orderComplete(clientSecret);
      }
    });
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
var orderComplete = function(clientSecret) {
  stripe.retrievePaymentIntent(clientSecret).then(function(result) {
    var paymentIntent = result.paymentIntent;
    var paymentIntentJson = JSON.stringify(paymentIntent, null, 2);
    document.querySelectorAll(".payment-view").forEach(function(view) {
      view.classList.add("hidden");
    });
    document.querySelectorAll(".completed-view").forEach(function(view) {
      view.classList.remove("hidden");
    });
    document.querySelector(".order-status").textContent =
      paymentIntent.status === "succeeded" ? "succeeded" : "failed";
    document.querySelector("pre").textContent = paymentIntentJson;
  });
};



// Show a spinner on payment submission
var changeLoadingState = function(isLoading) {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};
