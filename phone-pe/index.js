import express from "express";
import axios from "axios";
import uniqid from "uniqid"
import sha256 from "sha256"

const PORT = 3200;

// for phone-pe testing purpose
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

const app = express();

app.get("/", (req,res) => {
  res.send({ message: "Hi From phone pe " });
});
 
app.get("/pay", (req, res) => {
  const API_ENDPOINT = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const userid = 123;

  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userid,
    amount: 10000,
    redirectUrl: `http://localhost:3200/redirect-url/${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    callbackUrl: "https://webhook.site/callback-url",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };
  const bufferObj = Buffer.from(JSON.stringify(payload, "utf8"))
  const base63encodedPayload = bufferObj.toString("base64")
  const xVerify = sha256(base63encodedPayload + API_ENDPOINT + SALT_KEY) + "###" + SALT_INDEX

  const options = {
    method: "post",
    url: `${PHONE_PE_HOST_URL}${API_ENDPOINT}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY" : xVerify
    },
    data: {request: base63encodedPayload},
  };
  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
      //res.send(response.data)
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.get("/redirect-url/:merchantTransactionId", (req,res) => {
    const {merchantTransactionId} = req.params
    console.log("merchattransactionID: ",merchantTransactionId)
    if(merchantTransactionId){
        res.send(merchantTransactionId)
    }else{
        res.send({Error : 'Error'})
    }
})

app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);
});
