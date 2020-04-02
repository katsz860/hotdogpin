# Accepting a one-time payment for a hotdog pin (Web, MacOS)

## Requirements
* Make sure you have Node v10+
* Make sure you have a Stripe account (they are free to create if you don't already have one)
* Make sure you have homebrew installed (https://brew.sh/). If you don't, this could take a while, so I recommend starting now :) 


## Set up
1. If you haven't already installed the Stripe CLI, please do so by following the [installation steps](https://github.com/stripe/stripe-cli#installation) in the project README. The CLI is needed to locally test the webhooks that this implementation uses. Next, [link your Stripe account](https://stripe.com/docs/stripe-cli#link-account). After that, open a Terminal window and run this command:
```
stripe listen --forward-to localhost:3232/webhook
```
This will print a webhook signing secret that starts with "whsec_". Make note of this value because we will use it later
2. Clone this project from [here](GITHUB LINK), if you haven't already
3. Open the .env file (located in accept-a-card-payment-master_hotdog/server)
4. Find your API keys by going to your [Stripe developer dashboard](https://stripe.com/docs/development#api-keys)
5. Replace the public and secret keys within the .env file with your API keys from the developer dashboard:
```
STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>
STRIPE_SECRET_KEY=<replace-with-your-secret-key>
```
6. See if 'STATIC_DIR' in the .env file needs to be modified; it needs to tell the server where the client files are located; it does not need to be modified unless you changed the file structure
7. Lastly, set 'STRIPE_WEBHOOK_SECRET' in the .env file to the webhook signing secret that was printed in your terminal from step 1


## Run & test
1. Open one Terminal window and cd into the right directory (accept-a-card-payment-master_hotdog/server). Run this command:
```
npm run katie
```
If it's working properly, you should eventually see "Node server listening on port 3232!" in your console
2. Open a second Terminal window for the Stripe CLI and run this command:
```
stripe listen --forward-to localhost:3232/webhook
```
3. Open your browser and go to http://localhost:3232/. After the page has loaded, check the Stripe CLI terminal window and you should see it logging a post event with success status response code 200
4. Test the app!! One at a time, submit the 3 test cards listed in Step 5 of [Stripe's testing instructions](https://stripe.com/docs/payments/accept-a-payment#web). You can do this by manually  entering in the provided credit card number, any CVC, any postal code, a future expiration date, and then clicking the "Pay" button. After you click the button, you can check to see if the transaction was successful in a few ways. First, you should see "💰Payment received and recorded in log folder!" printed in the Terminal running your server. Second, in the Stripe CLI Terminal, you should see a payment_intent.succeeded event. Finally, if you open up the successful_payments.log file in the /logs folder, you should see the shipping information associated with this transaction appended at the bottom of the file. Once you have gone through all three provided test credit cards, you can click the "Run tests" button in Step 5 of [Stripe's testing instructions](https://stripe.com/docs/payments/accept-a-payment#web) and you should receive all green check marks. You can also trigger payments by opening a new terminal window and running this command:
```
stripe trigger payment_intent.succeeded
```
If you do this, you should see a charge in your Stripe dashboard that was created by Stripe CLI and you will also find a log in the successful_payments.log file with information for a Jenny Rosen