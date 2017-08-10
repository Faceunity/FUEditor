var NACL=require('./nacl_factory.js').instantiate(512<<20);
var path=require('path');
var fs=require('fs');
var crypto=require('crypto');

(function(){
	if(process.argv.length<4){
		console.log([
			'usage: ',process.argv[0],' ',process.argv[1],' <file-to-sign> <output> [key]',
		].join(''));
		return;
	}
	var secret_key=fs.readFileSync(path.resolve(__dirname,'nama'+(process.argv[4]||'')+'_sk.bin'));
	var public_key=fs.readFileSync(path.resolve(__dirname,'nama'+(process.argv[4]||'')+'_pk.bin'));
	var buf=fs.readFileSync(process.argv[2]);
	for(var i=4;i<65536;i++){
		if(i>=buf.length){break;}
		if(buf.readUInt32LE(buf.length-i)==0x06054b50){
			var pEOCD=buf.length-i;
			var szcomment=buf.readUInt16LE(pEOCD+20);
			if(szcomment>0){
				buf=buf.slice(0,buf.length-szcomment);
			}
			szcomment=NACL.crypto_sign_BYTES;
			buf.writeUInt16LE(szcomment,pEOCD+20);
			break;
		}
	}
	var buf2=NACL.crypto_sign_detached(NACL.crypto_hash(buf),secret_key);
	if(buf2.length!=NACL.crypto_sign_BYTES){
		console.log("bad sign size:",buf2.length,NACL.crypto_sign_BYTES);
		throw new Error("bad sign size")
	}
	var msg=Buffer.concat([buf,new Buffer(buf2)]);
	var obfuscation_key=fs.readFileSync(path.resolve(__dirname,'obfuscation_sk.bin'));
	var nonce=crypto.randomBytes(24);
	var ciphertext=NACL.crypto_secretbox(msg,nonce,obfuscation_key);
	fs.writeFileSync(process.argv[3],Buffer.concat([nonce,new Buffer(ciphertext)]));
})();
