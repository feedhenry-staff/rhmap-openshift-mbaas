var systemCall = require('./lib/systemCall.js');
var hostname = 'osm1-master1.feedhenry.net';
var password="Red Hat Mobile test account 1.";
var username = 'test';
var projectName = 'ph-mbaas-test';
var environments = ['dev', 'test', 'live'];
var FHDomain = 'http://testing.grdryn3.skunkhenry.com';
var FHUsername = 'testing-admin@example.com';
var FHPassword = 'Password1';
var async= require('async');

var createCall = function(command, args, options){
	return function(res){
		systemCall.execute(command, args,options,function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

function createMBaaSes(){
	return function(cb){ 
		var projectArray = [];
		var MBaaSName;	
		environments.forEach(function(environment){
			MBaaSName = projectName+"-"+environment;
			projectArray.push(createOpenshiftProject(MBaaSName));
			projectArray.push(createOpenshiftApp(MBaaSName));
			projectArray.push(createMBaaSTarget(MBaaSName));
			projectArray.push(createMBaaSEnvironment(MBaaSName));
		});
		async.series(projectArray, function(err, res){
			cb(err, res);
		});
	}
	
}


var openshiftLogin = function(){
	return function(cb){
		systemCall.execute('oc', ['login',hostname, '--insecure-skip-tls-verify=true', '--username='+username, '--password='+password], {label:'Logging into OpenShift'}, function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var createOpenshiftProject = function(MBaaSName){
	return function(cb){
		systemCall.execute('oc', ['new-project',MBaaSName], {label:'Creating Openshift project '+ MBaaSName}, function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var createMBaaSTarget = function(MBaaSName){
	return function(cb){
		systemCall.execute('fhc', ['admin','mbaas', 'create', '--id='+MBaaSName, '--type=openshift3', '--fhMbaasHost=https://'+MBaaSName+'.apps.osm1.feedhenry.net', '--provisionMBaaS=true', '--type_target=openshift3', '--url=https://osm1-master1.feedhenry.net:8443', '--username='+ username, '--password='+password, '--routerDNSUrl=*.apps.osm1.feedhenry.net', '--servicekey=""'], {label:'Creating MBaaS Target '+ MBaaSName}, function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var createMBaaSEnvironment = function(MBaaSName){
	return function(cb){
		systemCall.execute('fhc', ['admin', 'environments', 'create', '--id='+MBaaSName, '--label='+MBaaSName, '--targets='+MBaaSName], {label: 'Creating MBaaS Environment '+ MBaaSName}, function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var createOpenshiftApp = function(MBaaSName){
	return function(cb){
		systemCall.execute('oc', ['new-app', '-f ./fh-mbaas-template-1node.json', '-p MBAAS_ROUTER_DNS='+MBaaSName+'.apps.osm1.feedhenry.net'], {label:'Creating MBaaS '+ MBaaSName}, function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var createOpenshiftProject = function(){
	return function(cb){
		systemCall.execute('oc', ['new-project',projectName], {label:'Creating Openshift project '+ projectName},function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var rhMAPTarget = function(){
	return function(cb){
		systemCall.execute('fhc', ['target', FHDomain], {label:'Setting FHC Target'},function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var rhMAPLogin = function(){
	return function(cb){
		systemCall.execute('fhc',['login', FHUsername, FHPassword], {label: 'Logging into RHMAP Core'},function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}

var createRHMAPProject = function(){
	return function(cb){
		systemCall.execute('fhc', ['projects', 'create' ,'projectName'], {label:'Creating RH MAP Project'},function(err, result){
			if (err){
				cb(err, null)
			} else {
				cb(null, result)
			}
		});
	}
}


function process(){
	var funcArray = [];
	funcArray.push(openshiftLogin());
	funcArray.push(rhMAPTarget());
	funcArray.push(rhMAPLogin());
	funcArray.push(createMBaaSes());
	funcArray.push(createRHMAPProject());
	async.series(funcArray, function(err, res){
		if (err){
			console.error(err)
		} else {
			console.log(res);
		}
	})

}

process();
// .then(systemCall.execute('fhc',['admin-users', 'read', 'phTest']));




//oc delete project <<projectName>>