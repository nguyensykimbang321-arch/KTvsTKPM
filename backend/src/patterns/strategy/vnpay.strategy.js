const crypto = require('crypto');
const PaymentStrategy = require('./payment.strategy');

class VNPayStrategy extends PaymentStrategy {
  constructor() {
    super();
    this.tmnCode = process.env.VNP_TMNCODE;
    this.secretKey = process.env.VNP_HASHSECRET;
    this.vnpUrl = process.env.VNP_URL;
    this.returnUrl = process.env.VNP_RETURNURL;
  }

  async processPayment(orderData) {
    const { orderId, amount, orderInfo, ipAddress } = orderData;
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = this.returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddress;
    vnp_Params['vnp_CreateDate'] = this._formatDate(new Date());

    vnp_Params = this._sortObject(vnp_Params);

    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    vnp_Params['vnp_SecureHash'] = signed;
    const finalUrl = this.vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

    return { paymentUrl: finalUrl, method: 'vnpay' };
  }

  async verifyPayment(vnp_Params) {
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this._sortObject(vnp_Params);
    const querystring = require('qs');
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    const hmac = crypto.createHmac("sha512", this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    return secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00';
  }

  _sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  _formatDate(date) {
    return date.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  }
}

module.exports = VNPayStrategy;
