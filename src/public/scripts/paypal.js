paypal.Button.render({
	    // Configure environment
	    env: 'sandbox',
	    commit: true,
	    client: {
	      sandbox: 'AT-t9dmPqy-6PDNMHhAIE8uIN7HIf2YO_JlB2SP2nCjrwNazPU-DsQVd-UuALFRir3J5myYcakH6p5Ol',
	      //production: 'AT-t9dmPqy-6PDNMHhAIE8uIN7HIf2YO_JlB2SP2nCjrwNazPU-DsQVd-UuALFRir3J5myYcakH6p5Ol'
	    },
	    // Customize button (optional)
	    locale: 'en_US',
	    style: {
	      size: 'small',
	      color: 'gold',
	      shape: 'pill',
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
	    		//jquery here?
	    	})
	    }
	  }, '#paypal-button');