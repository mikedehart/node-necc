paypal.Button.render({
	    // Configure environment
	    env: 'sandbox',
	    commit: true,
	    client: {
	      sandbox: 'AYz1S9YsAPkZxv3b25F1o1HIzjITRrm1UMuEctKXPCGdCYsBAiuq1pUn4nRwd3WFZe9Efl28Fi5RcFi5',
	      //production: 'AUa8TTQdvds_XTwBWvFUBNxu6beWJSGyUX54klQO_un5j08kmRPCYKtkohSnYAvJ9scbfNY92y-fvQlS'
	    },
	    locale: 'en_US',
	    style: {
	      size: 'medium',
	      color: 'blue',
	      shape: 'rect',
	      label: 'pay'
	    },
	    // Set up a payment
	    payment: function(data, actions) {
	    	return actions.request.post('/members/create')
	    		.then(function(res) {
	    			return res.id;
	    		});
	    },
	    // Execute the payment
	    onAuthorize: function(data, actions) {
	    	return actions.request.post('/members/authorize', {
	    		paymentID: data.paymentID,
	    		payerID: data.payerID
	    	})
	    	.then(function(res) {
	    		if(res.url) {
	    			window.location = res.url;
	    		} else {
	    			window.alert('Error processing purchase: ' + res.name + ' ' + res.message);
	    		}
	    	})
	    	.catch(err => window.alert(err));
	    }
	  }, '#paypal-button');