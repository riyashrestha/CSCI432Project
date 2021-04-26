//function for generating keys
function gen() {
	let userKey     = document.getElementById("userKey"),

		//user inputs
		userName    = document.getElementById("userName").value,
		userEmail   = document.getElementById("userEmail").value,
		passph      = document.getElementById("passphrase").value;
		
	let keyOptions = {
		userIds: [{name: userName, email: userEmail}],
		curve: "ed25519",
		numBits: 2048,
		passphrase: passph
	};

	let user = {};

	openpgp.generateKey(keyOptions)
	.then((key) => {
		user.privateKey = key.privateKeyArmored;
		user.publicKey = key.publicKeyArmored;
		userKey.innerHTML = userName + "'s keys are generated. Please download it!";
		return Promise.resolve();
	})
	
	// Start file download.
	document.getElementById("dwn-btn1").addEventListener("click", function(){
		// Generate private and public key for the user
		var filename1 = "private.txt";
		var filename2 = "public.txt";
		
		download(filename1, user.privateKey);
		download(filename2, user.publicKey);
	}, false);
}

//function for downloading files
function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

//function for encrypting file
function enc(){
    let encrypted = document.getElementById("encrypted");

	var encryptInput = "";
	var publicK = "";
	var encryptedMessage = "";
	
	//get the content of file1 that is file to be encrypted
	var file1 = document.getElementById("encrypt-input").files[0];

	//get the content of file2 that is public key file
	var file2 = document.getElementById("public-key").files[0];
	//read file1 and file2
	var reader1 = new FileReader();
	var reader2 = new FileReader();

	//check if file1 is not empty
	if (file1)  {
		reader1.readAsText(file1, "UTF-8");
		reader1.onload = function (evt) {
			encryptInput = evt.target.result;

			//check if file2 is not empty
			if (file2) {
				reader2.readAsText(file2, "UTF-8");
				reader2.onload = function (evt) {
					publicK = evt.target.result;

					//if file1 and file2 exists then do encryption
					// Using user's public key, we encrypt the contents of the file
					const options = {
						data: encryptInput,
						publicKeys:  openpgp.key.readArmored(publicK).keys
					};

					openpgp.encrypt(options)
					.then((cipherText)=>{
						// We get the cipherText which is the encrypted contents of the file.
						encryptedMessage = cipherText.data;
						encrypted.innerHTML = "Your file is encrypted. Please download it!";
						document.getElementById("display").innerHTML = "";
						return Promise.resolve();		
					})
				}
				reader2.onerror = function () {
					document.getElementById("display").innerHTML = "Error reading the public key file!";
				}
			}
		}
		reader1.onerror = function () {
			document.getElementById("display").innerHTML = "Error reading file to be encrypted!";
		}
	}
	// Start file download.
	document.getElementById("dwn-btn2").addEventListener("click", function() {
		// Generate encrypted file
		var filename1 = "encrypted.txt";
		
		download(filename1, encryptedMessage);
	}, false);
}

//function for decrypting file
function dec() {
    let decrypted  = document.getElementById("decrypted");

	var decryptInput = "";
	var privateK = "";
	var decryptedMessage = "";
	
	//get the content of file1 that is file to be decrypted
	var file1 = document.getElementById("decrypt-input").files[0];
	
	//get the content of file2 that is private key file
	var file2 = document.getElementById("private-key").files[0];
	
	//get the passphrase used to encrypt the private key
	let passph2 = document.getElementById("passphrase2").value;
	
	//read file1 and file2
	var reader1 = new FileReader();
	var reader2 = new FileReader();

	//check if file1 is not empty
	if (file1) {
		reader1.readAsText(file1, "UTF-8");
		reader1.onload = function (evt) {
			decryptInput = evt.target.result;

			//check if file2 is not empty
			if (file2) {
				reader2.readAsText(file2, "UTF-8");
				reader2.onload = function (evt) {
					privateK = evt.target.result;

					//check if passphrase is not empty
					if(passph2) {
						//if file1, file2 and passphrase exists then do decryption
						
						// Using user's private key, we decrypt the contents of the file
						//but before we can use the private key, we need to decrypt it using the passphrase
						let privateKey = openpgp.key.readArmored(privateK).keys[0];
						if (privateKey.decrypt(passph2)) {
							openpgp.decrypt({
								privateKey: privateKey,
								message: openpgp.message.readArmored(decryptInput)
							}) 
							.then((decryptedData) => {
								// If everything goes well we can now read the contents of user's message 
								decryptedMessage = decryptedData.data;
								decrypted.innerHTML = "Your file is decrypted. Please download it!";
								document.getElementById("display").innerHTML = "";
							})
							.catch((err) => {
								// In case something goes wrong
								console.error(err);
							})
						} 
						else document.getElementById("display").innerHTML = "Wrong passphrase!";
					}
					else document.getElementById("display").innerHTML = "Error in the passphrase!";
				}
				reader2.onerror = function () {
					document.getElementById("display").innerHTML = "Error reading the public key file!";
				}
			}
		}
		reader1.onerror = function () {
			document.getElementById("display").innerHTML = "Error reading file to be encrypted!";
		}
	}
	// Start file download.
	document.getElementById("dwn-btn2").addEventListener("click", function() {
		// Generate decrypted file
		var filename1 = "decrypted.txt";
		
		download(filename1, decryptedMessage);
	}, false);
}

