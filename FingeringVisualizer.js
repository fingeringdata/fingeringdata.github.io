//console.log(SitchToSitchHeight('E4'));
//console.log(i+' '+fileContent[i].split(/\s+/));

var files;
var fingeringsGT=[];
var fingeringsEST1=[];
var fingeringsEST2=[];
var drawmode=1;
var selectedInput = null;

var xoffset=100;
var heightC4=200;
var pxPerSec=200;
var legerWidth=0.5;
var heightUnit=10;
var maxTime=2.1;

window.onload = function(){
	Draw();
}//end onload

function SitchToPitch(sitch){
	var p_rel,p;
	if(sitch[0]=='C'){p_rel=60;
	}else if(sitch[0]=='D'){p_rel=62;
	}else if(sitch[0]=='E'){p_rel=64;
	}else if(sitch[0]=='F'){p_rel=65;
	}else if(sitch[0]=='G'){p_rel=67;
	}else if(sitch[0]=='A'){p_rel=69;
	}else if(sitch[0]=='B'){p_rel=71;
	}//endif
	sitch=sitch.slice(1);
	var oct=Number(sitch[sitch.length-1]);
	sitch=sitch.slice(0,sitch.length-1);
	p=p_rel+(oct-4)*12;
	if(sitch==""){p+=0;
	}else if(sitch=="#"){p+=1;
	}else if(sitch=="##"){p+=2;
	}else if(sitch=="b"){p-=1;
	}else if(sitch=="bb"){p-=2;
	}else if(sitch=="+"){p+=1;
	}else if(sitch=="++"){p+=2;
	}else if(sitch=="-"){p-=1;
	}else if(sitch=="--"){p-=2;
	}//endif
	return p;
}//end SitchToPitch

function SitchToSitchHeight(sitch){
	var oct=Number(sitch[sitch.length-1]);
	var ht;
	if(sitch[0]=='C'){ht=0;
	}else if(sitch[0]=='D'){ht=1;
	}else if(sitch[0]=='E'){ht=2;
	}else if(sitch[0]=='F'){ht=3;
	}else if(sitch[0]=='G'){ht=4;
	}else if(sitch[0]=='A'){ht=5;
	}else if(sitch[0]=='B'){ht=6;
	}else{ht=0;
	}//endif
	return ht+7*(oct-4);
}//end SitchToSitchHeight

function SitchToAcc(sitch){
	var accLab=sitch.slice(1,sitch.length-1);
	if(accLab==""){return 0;
	}else if(accLab=="#"){return 1;
	}else if(accLab=="##"){return 2;
	}else if(accLab=="b"){return -1;
	}else if(accLab=="bb"){return -2;
	}else if(accLab=="+"){return 1;
	}else if(accLab=="++"){return 2;
	}else if(accLab=="-"){return -1;
	}else if(accLab=="--"){return -2;
	}else{return 0;
	}//endif
}//end SitchToAcc


class PianoRollEvt{
	constructor(){
		this.ID=-1;
		this.ontime=-1;
		this.offtime=-1;
		this.sitch="NA";
		this.pitch=-1;
		this.onvel=80;
		this.offvel=80;
		this.channel=0;
		this.endtime=-1;
		this.label="";
		this.ext1=-1;
	}//end constructor

	FromSprEvt(evt){
		this.ID=Number(evt[0]);
		this.ontime=Number(evt[1]);
		this.offtime=Number(evt[2]);
		this.sitch=evt[3];
		this.pitch=SitchToPitch(evt[3]);
		this.onvel=Number(evt[4]);
		this.offvel=Number(evt[5]);
		this.channel=Number(evt[6]);
		this.endtime=-1;
		this.label="";
		this.ext1=-1;
	}//end FromSprEvt
}//endclass PianoRollEvt

function FingerNumToInt(fingerNum){
	if(fingerNum[0]=='-'){
		if(fingerNum[1]=='1'){return -1;
		}else if(fingerNum[1]=='2'){return -2;
		}else if(fingerNum[1]=='3'){return -3;
		}else if(fingerNum[1]=='4'){return -4;
		}else if(fingerNum[1]=='5'){return -5;
		}else{return 0;
		}//endif
	}else{
		if(fingerNum[0]=='1'){return 1;
		}else if(fingerNum[0]=='2'){return 2;
		}else if(fingerNum[0]=='3'){return 3;
		}else if(fingerNum[0]=='4'){return 4;
		}else if(fingerNum[0]=='5'){return 5;
		}else{return 0;
		}//endif
	}//endif
}//end FingerNumToInt

class FingeringEvt{
	constructor(){
		this.ID=-1;
		this.ontime=-1;
		this.offtime=-1;
		this.sitch="NA";
		this.pitch=-1;
		this.onvel=80;
		this.offvel=80;
		this.channel=0;
		this.fingerNum="";
		this.finger=-1;
		this.endtime=-1;
		this.label="";
		this.ext1=-1;
	}//end constructor

	FromFileEvt(evt){
		this.ID=Number(evt[0]);
		this.ontime=Number(evt[1]);
		this.offtime=Number(evt[2]);
		this.sitch=evt[3];
		this.pitch=SitchToPitch(evt[3]);
		this.onvel=Number(evt[4]);
		this.offvel=Number(evt[5]);
		this.channel=Number(evt[6]);
		this.fingerNum=evt[7];
		this.finger=FingerNumToInt(evt[7]);
		this.endtime=-1;
		this.label="";
		this.ext1=-1;
	}//end FromSprEvt
}//endclass FingeringEvt

function ReadFile(file,addmode=1){
	var reader = new FileReader();
	reader.readAsText(file);

	reader.onload = function(e){
		fin=[];
		var fileContent=reader.result.split(/\n/);
		for(var i=0,len=fileContent.length;i<len;i+=1){
			if(fileContent[i]==""){continue;}
			if(fileContent[i][0]=='/' || fileContent[i][0]=='#'){continue;}
			var finEvt=new FingeringEvt();
			finEvt.FromFileEvt(fileContent[i].split(/\s+/));
			fin.push(finEvt);
		}//endfor i

		if(fin[fin.length-1].offtime+3>maxTime){maxTime=fin[fin.length-1].offtime+3;}

		if(addmode==1){
			fingeringsGT.push(fin);
		}else if(addmode==2){
			fingeringsEST1.push(fin);
		}else if(addmode==3){
			fingeringsEST2.push(fin);
		}//endif
	}//end reader.onload

}//end ReadFile


function Draw(){

	drawmode=1;
	var modeRadio=document.getElementsByName("modeRadio");
	if(modeRadio[0].checked){drawmode=0;}

//console.log(document.getElementById("timeScale").value);
	pxPerSec=document.getElementById("timeScale").value*200;

	var width=xoffset+maxTime*pxPerSec;
	document.getElementById('display').innerHTML='<svg id="mysvg" xmlns="http://www.w3.org/2000/svg" width="'+(width+20)+'" height="400"></svg>';
	document.getElementById('display').style.width=(width+20)+'px';
	mysvg=document.getElementById('mysvg');
	for(var i=-5;i<=5;i+=1){
		if(i==0){continue;}
		var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
		line1.setAttribute('x1',0);
		line1.setAttribute('x2',width);
		line1.setAttribute('y1',200+10*i);
		line1.setAttribute('y2',200+10*i);
		line1.setAttribute('stroke-opacity',1);
		line1.setAttribute('stroke','rgb(120,120,120)');
		line1.setAttribute('stroke-width',1);
		mysvg.appendChild(line1);
	}//endfor i

	var str='';

	for(var t=0;t<maxTime;t+=1){
		str+='<div style="position:absolute; left:'+(t*pxPerSec+xoffset-legerWidth)+'px; top:'+(heightC4-5*heightUnit-legerWidth)+'px; width:'+0+'px; height:'+10*heightUnit+'px; border:'+legerWidth+'px solid rgba(30,30,30,0.3);"></div>';
		str+='<div style="position:absolute; left:'+(t*pxPerSec+xoffset-4)+'px; top:'+(heightC4-5*heightUnit-legerWidth-20)+'px; width:'+0+'px; height:'+10*heightUnit+'px; color:rgba(30,30,30,0.3); font-size:8pt">'+t+'</div>';
	}//endfor t
	str+='<img src="img/Gclef.png" height="'+(7.5*heightUnit)+'" style="position:absolute; left:'+(20)+'px; top:'+(heightC4-6.5*heightUnit)+'px;"/>';
	str+='<img src="img/Fclef.png" height="'+(3.4*heightUnit)+'" style="position:absolute; left:'+(20+3)+'px; top:'+(heightC4+0.9*heightUnit)+'px;"/>';

	for(var i=0;i<=5;i+=1){
		if(i>=1 && i<=5){
			str+='<div style="position:absolute; left:'+(xoffset-30)+'px; top:'+(heightC4-(15+i)*heightUnit-1)+'px; width:20px; height:10px; font-size:8pt">'+i+'</div>';
			str+='<div style="position:absolute; left:'+(xoffset-30)+'px; top:'+(heightC4+(14+i)*heightUnit-1)+'px; width:20px; height:10px; font-size:8pt">'+i+'</div>';
		}//endif
		if(i==0||i==5){
			str+='<div style="position:absolute; left:'+(xoffset-20)+'px; top:'+(heightC4-(15+i)*heightUnit-1)+'px; border:1px solid rgba(20,20,20,1); width:'+(width-xoffset+20)+'px; height:'+0+'px;"></div>';
			str+='<div style="position:absolute; left:'+(xoffset-20)+'px; top:'+(heightC4+(15+i)*heightUnit-1)+'px; border:1px solid rgba(20,20,20,1); width:'+(width-xoffset+20)+'px; height:'+0+'px;"></div>';
			continue;
		}//endif
		str+='<div style="position:absolute; left:'+(xoffset-20)+'px; top:'+(heightC4-(15+i)*heightUnit-0.5)+'px; border:0.5px solid rgba(200,0,0,0.15); width:'+(width-xoffset+20)+'px; height:'+0+'px;"></div>';
		str+='<div style="position:absolute; left:'+(xoffset-20)+'px; top:'+(heightC4+(15+i)*heightUnit-0.5)+'px; border:0.5px solid rgba(200,0,0,0.15); width:'+(width-xoffset+20)+'px; height:'+0+'px;"></div>';
	}//endfor i

	//Draw notes
	var fingeringRef=[];
	if(fingeringsGT.length>0){
		fingeringRef=fingeringsGT[0];
	}else if(fingeringsEST1.length>0){
		fingeringRef=fingeringsEST1[0];
	}else if(fingeringsEST2.length>0){
		fingeringRef=fingeringsEST2[0];
	}//endif

	for(var i=0,len=fingeringRef.length;i<len;i+=1){
		var finEvt=fingeringRef[i];
		var sitchHeight=SitchToSitchHeight(finEvt.sitch);

		if(sitchHeight==0){
			str+='<div style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-8)+'px; top:'+(heightC4-legerWidth)+'px; width:'+16+'px; height:0px; border:'+legerWidth+'px solid rgba(0,0,0,1);"></div>';
		}else if(sitchHeight>11){
			for(let h=12,end=sitchHeight;h<=end;h+=2){
				str+='<div style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-8)+'px;  top:'+(heightC4-0.5*heightUnit*h-legerWidth)+'px;width:'+16+'px; height:0px; border:0.5px solid rgba(0,0,0,1);"></div>';
			}//endfor h
		}else if(sitchHeight<-11){
			for(let h=-12,end=sitchHeight;h>=end;h-=2){
				str+='<div style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-8)+'px; top:'+(heightC4-0.5*heightUnit*h-legerWidth)+'px; width:'+16+'px; height:0px; border:0.5px solid rgba(0,0,0,1);"></div>';
			}//endfor h
		}//endif

		if(finEvt.channel==0){
			str+='<div id="note'+finEvt.ID+'" contentEditable=true style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset)+'px; top:'+(-(1+sitchHeight)*5+heightC4+0.5)+'px; width:'+(finEvt.offtime-finEvt.ontime)*pxPerSec+'px; height:9px; background-color:rgba(50,255,0,0.8); color:red; font-size:7px;">'+finEvt.ID+'</div>';
			str+='<div style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-1)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5)+'px; width:'+(finEvt.offtime-finEvt.ontime)*pxPerSec+'px; height:9px; border:1px solid rgba(20,20,20,0.7);"></div>';
		}else{
			str+='<div id="note'+finEvt.ID+'" contentEditable=true style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset)+'px; top:'+(-(1+sitchHeight)*5+heightC4+0.5)+'px; width:'+(finEvt.offtime-finEvt.ontime)*pxPerSec+'px; height:9px; background-color:rgba(255,120,30,0.8); color:blue; font-size:7px;">'+finEvt.ID+'</div>';
			str+='<div style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-1)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5)+'px; width:'+(finEvt.offtime-finEvt.ontime)*pxPerSec+'px; height:9px; border:1px solid rgba(20,20,20,0.7);"></div>';
		}//endif

		var acc=SitchToAcc(finEvt.sitch);
		if(acc==1){
			str+='<img src="img/Sharp.png" height="'+(2*heightUnit)+'" style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-9)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1-0.4*heightUnit)+'px;"/>';
		}else if(acc==2){
			str+='<img src="img/DoubleSharp.png" height="'+(heightUnit)+'" style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-12)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1+0.1*heightUnit)+'px;"/>';
		}else if(acc==-1){
			str+='<img src="img/Flat.png" height="'+(1.7*heightUnit)+'" style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-9)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5-0.6*heightUnit)+'px;"/>';
		}else if(acc==-2){
			str+='<img src="img/DoubleFlat.png" height="'+(1.7*heightUnit)+'" style="position:absolute; left:'+(finEvt.ontime*pxPerSec+xoffset-14)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1-0.6*heightUnit)+'px;"/>';
		}//endif
	}//endfor i

	//Draw fingerings
	if(drawmode==0){

		for(var ii=0,ii_len=fingeringsGT.length;ii<ii_len;ii+=1){
			finRH=[];
			finLH=[];
			for(var i=0,len=fingeringsGT[ii].length;i<len;i+=1){
				if(fingeringsGT[ii][i].finger>0){finRH.push(fingeringsGT[ii][i]);
				}else if(fingeringsGT[ii][i].finger<0){finLH.push(fingeringsGT[ii][i]);
				}//endif
			}//endfor i
			for(var i=0,len=finRH.length;i<len;i+=1){
				str+='<div style="position:absolute; left:'+(finRH[i].ontime*pxPerSec+xoffset)+'px; top:'+(heightC4-(15+finRH[i].finger)*heightUnit)+'px; width:'+((finRH[i].offtime-finRH[i].ontime)*pxPerSec)+'px; height:'+heightUnit+'px; background-color:rgba(30,30,30,0.2);"></div>';
			}//endfor i
			for(var i=0,len=finLH.length;i<len;i+=1){
				str+='<div style="position:absolute; left:'+(finLH[i].ontime*pxPerSec+xoffset)+'px; top:'+(heightC4+(15-finLH[i].finger-1)*heightUnit)+'px; width:'+((finLH[i].offtime-finLH[i].ontime)*pxPerSec)+'px; height:'+heightUnit+'px; background-color:rgba(30,30,30,0.2);"></div>';
			}//endfor i
		}//endfor ii

		for(var ii=0,ii_len=fingeringsEST1.length;ii<ii_len;ii+=1){
			finRH=[];
			finLH=[];
			for(var i=0,len=fingeringsEST1[ii].length;i<len;i+=1){
				if(fingeringsEST1[ii][i].finger>0){finRH.push(fingeringsEST1[ii][i]);
				}else if(fingeringsEST1[ii][i].finger<0){finLH.push(fingeringsEST1[ii][i]);
				}//endif
			}//endfor i
			for(var i=0,len=finRH.length;i<len;i+=1){
				str+='<div style="position:absolute; left:'+(finRH[i].ontime*pxPerSec+xoffset)+'px; top:'+(heightC4-(15-0.4+finRH[i].finger)*heightUnit)+'px; width:'+((finRH[i].offtime-finRH[i].ontime)*pxPerSec)+'px; height:'+0.2*heightUnit+'px; background-color:rgba(255,30,100,1);"></div>';
			}//endfor i
			for(var i=0,len=finLH.length;i<len;i+=1){
				str+='<div style="position:absolute; left:'+(finLH[i].ontime*pxPerSec+xoffset)+'px; top:'+(heightC4+(15+0.4-finLH[i].finger-1)*heightUnit)+'px; width:'+((finLH[i].offtime-finLH[i].ontime)*pxPerSec)+'px; height:'+0.2*heightUnit+'px; background-color:rgba(255,30,100,1);"></div>';
			}//endfor i
		}//endfor ii

		for(var ii=0,ii_len=fingeringsEST2.length;ii<ii_len;ii+=1){
			finRH=[];
			finLH=[];
			for(var i=0,len=fingeringsEST2[ii].length;i<len;i+=1){
				if(fingeringsEST2[ii][i].finger>0){finRH.push(fingeringsEST2[ii][i]);
				}else if(fingeringsEST2[ii][i].finger<0){finLH.push(fingeringsEST2[ii][i]);
				}//endif
			}//endfor i
			for(var i=0,len=finRH.length;i<len;i+=1){
				str+='<div style="position:absolute; left:'+(finRH[i].ontime*pxPerSec+xoffset)+'px; top:'+(heightC4-(15-0.4+finRH[i].finger)*heightUnit)+'px; width:'+((finRH[i].offtime-finRH[i].ontime)*pxPerSec)+'px; height:'+0.2*heightUnit+'px; background-color:rgba(50,80,255,1);"></div>';
			}//endfor i
			for(var i=0,len=finLH.length;i<len;i+=1){
				str+='<div style="position:absolute; left:'+(finLH[i].ontime*pxPerSec+xoffset)+'px; top:'+(heightC4+(15+0.4-finLH[i].finger-1)*heightUnit)+'px; width:'+((finLH[i].offtime-finLH[i].ontime)*pxPerSec)+'px; height:'+0.2*heightUnit+'px; background-color:rgba(50,80,255,1);"></div>';
			}//endfor i
		}//endfor ii

	}else if(drawmode==1){

		for(var ii=0,ii_len=fingeringsGT.length;ii<ii_len;ii+=1){
			finRH=[];
			finLH=[];
			for(var i=0,len=fingeringsGT[ii].length;i<len;i+=1){
				if(fingeringsGT[ii][i].finger>0){finRH.push(fingeringsGT[ii][i]);
				}else if(fingeringsGT[ii][i].finger<0){finLH.push(fingeringsGT[ii][i]);
				}//endif
			}//endfor i
			for(var i=0,len=finRH.length;i<len;i+=1){
				var circle1=document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle1.setAttribute('cx',finRH[i].ontime*pxPerSec+xoffset+5);
				circle1.setAttribute('cy',55-10*finRH[i].finger);
				circle1.setAttribute('r',5);
				circle1.setAttribute('opacity',0.2);			
				circle1.setAttribute('fill','rgb(30,30,30)');
				mysvg.appendChild(circle1);	
				if(i==0){continue;}
				var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
				line1.setAttribute('x1',finRH[i-1].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('x2',finRH[i].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('y1',55-10*finRH[i-1].finger);
				line1.setAttribute('y2',55-10*finRH[i].finger);
				line1.setAttribute('stroke-opacity',0.2);			
				line1.setAttribute('stroke','rgb(30,30,30)');
				line1.setAttribute('stroke-width',10);
				mysvg.appendChild(line1);	
			}//endfor i
			for(var i=0,len=finLH.length;i<len;i+=1){
				var circle1=document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle1.setAttribute('cx',finLH[i].ontime*pxPerSec+xoffset+5);
				circle1.setAttribute('cy',345-10*finLH[i].finger);
				circle1.setAttribute('r',5);
				circle1.setAttribute('opacity',0.2);			
				circle1.setAttribute('fill','rgb(30,30,30)');
				mysvg.appendChild(circle1);	
				if(i==0){continue;}
				var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
				line1.setAttribute('x1',finLH[i-1].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('x2',finLH[i].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('y1',345-10*finLH[i-1].finger);
				line1.setAttribute('y2',345-10*finLH[i].finger);
				line1.setAttribute('stroke-opacity',0.2);			
				line1.setAttribute('stroke','rgb(30,30,30)');
				line1.setAttribute('stroke-width',10);
				mysvg.appendChild(line1);
			}//endfor i
		}//endfor ii

		for(var ii=0,ii_len=fingeringsEST1.length;ii<ii_len;ii+=1){
			finRH=[];
			finLH=[];
			for(var i=0,len=fingeringsEST1[ii].length;i<len;i+=1){
				if(fingeringsEST1[ii][i].finger>0){finRH.push(fingeringsEST1[ii][i]);
				}else if(fingeringsEST1[ii][i].finger<0){finLH.push(fingeringsEST1[ii][i]);
				}//endif
			}//endfor i
			for(var i=0,len=finRH.length;i<len;i+=1){
				var circle1=document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle1.setAttribute('cx',finRH[i].ontime*pxPerSec+xoffset+5);
				circle1.setAttribute('cy',55-10*finRH[i].finger);
				circle1.setAttribute('r',3);
				circle1.setAttribute('opacity',1);			
				circle1.setAttribute('fill','rgb(255,30,100)');
				mysvg.appendChild(circle1);	
				if(i==0){continue;}
				var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
				line1.setAttribute('x1',finRH[i-1].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('x2',finRH[i].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('y1',55-10*finRH[i-1].finger);
				line1.setAttribute('y2',55-10*finRH[i].finger);
				line1.setAttribute('stroke-opacity',1);
				line1.setAttribute('stroke','rgb(255,30,100)');
				line1.setAttribute('stroke-width',2);
				mysvg.appendChild(line1);
			}//endfor i
			for(var i=0,len=finLH.length;i<len;i+=1){
				var circle1=document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle1.setAttribute('cx',finLH[i].ontime*pxPerSec+xoffset+5);
				circle1.setAttribute('cy',345-10*finLH[i].finger);
				circle1.setAttribute('r',3);
				circle1.setAttribute('opacity',1);			
				circle1.setAttribute('fill','rgb(255,30,100)');
				mysvg.appendChild(circle1);	
				if(i==0){continue;}
				var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
				line1.setAttribute('x1',finLH[i-1].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('x2',finLH[i].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('y1',345-10*finLH[i-1].finger);
				line1.setAttribute('y2',345-10*finLH[i].finger);
				line1.setAttribute('stroke-opacity',1);
				line1.setAttribute('stroke','rgb(255,30,100)');
				line1.setAttribute('stroke-width',2);
				mysvg.appendChild(line1);
			}//endfor i
		}//endfor ii

		for(var ii=0,ii_len=fingeringsEST2.length;ii<ii_len;ii+=1){
			finRH=[];
			finLH=[];
			for(var i=0,len=fingeringsEST2[ii].length;i<len;i+=1){
				if(fingeringsEST2[ii][i].finger>0){finRH.push(fingeringsEST2[ii][i]);
				}else if(fingeringsEST2[ii][i].finger<0){finLH.push(fingeringsEST2[ii][i]);
				}//endif
			}//endfor i
			for(var i=0,len=finRH.length;i<len;i+=1){
				var circle1=document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle1.setAttribute('cx',finRH[i].ontime*pxPerSec+xoffset+5);
				circle1.setAttribute('cy',55-10*finRH[i].finger);
				circle1.setAttribute('r',3);
				circle1.setAttribute('opacity',1);			
				circle1.setAttribute('fill','rgb(50,80,255)');
				mysvg.appendChild(circle1);	
				if(i==0){continue;}
				var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
				line1.setAttribute('x1',finRH[i-1].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('x2',finRH[i].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('y1',55-10*finRH[i-1].finger);
				line1.setAttribute('y2',55-10*finRH[i].finger);
				line1.setAttribute('stroke-opacity',1);
				line1.setAttribute('stroke','rgb(50,80,255)');
				line1.setAttribute('stroke-width',2);
				mysvg.appendChild(line1);
			}//endfor i
			for(var i=0,len=finLH.length;i<len;i+=1){
				var circle1=document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle1.setAttribute('cx',finLH[i].ontime*pxPerSec+xoffset+5);
				circle1.setAttribute('cy',345-10*finLH[i].finger);
				circle1.setAttribute('r',3);
				circle1.setAttribute('opacity',1);			
				circle1.setAttribute('fill','rgb(50,80,255)');
				mysvg.appendChild(circle1);	
				if(i==0){continue;}
				var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
				line1.setAttribute('x1',finLH[i-1].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('x2',finLH[i].ontime*pxPerSec+xoffset+5);
				line1.setAttribute('y1',345-10*finLH[i-1].finger);
				line1.setAttribute('y2',345-10*finLH[i].finger);
				line1.setAttribute('stroke-opacity',1);
				line1.setAttribute('stroke','rgb(50,80,255)');
				line1.setAttribute('stroke-width',2);
				mysvg.appendChild(line1);
			}//endfor i
		}//endfor ii

	}//endif drawmode

	document.getElementById('display').innerHTML+=str;

}//end Draw


function ClearDisplay(){
	maxTime=2.1;
	fingeringsGT=[];
	fingeringsEST1=[];
	fingeringsEST2=[];
	document.getElementById('filename1').value='';
	document.getElementById('filename2').value='';
	document.getElementById('filename3').value='';
	Draw();
}//end ClearDisplay


var elDrop = document.getElementById('dropzone');

elDrop.addEventListener('dragover', function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	elDrop.classList.add('dropover');
});

elDrop.addEventListener('dragleave', function(event) {
	elDrop.classList.remove('dropover');
});

elDrop.addEventListener('drop', function(event) {
	event.preventDefault();
	elDrop.classList.remove('dropover');
	files=event.dataTransfer.files;
	document.getElementById('filename1').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i]);
		document.getElementById('filename1').value+=files[i].name+'\n';
	}//endfor i
});

var elDrop2 = document.getElementById('dropzone2');

elDrop2.addEventListener('dragover', function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	elDrop2.classList.add('dropover');
});

elDrop2.addEventListener('dragleave', function(event) {
	elDrop2.classList.remove('dropover');
});

elDrop2.addEventListener('drop', function(event) {
	event.preventDefault();
	elDrop2.classList.remove('dropover');
	files=event.dataTransfer.files;
	document.getElementById('filename2').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i],2);
		document.getElementById('filename2').value+=files[i].name+'\n';
	}//endfor i
});

var elDrop3 = document.getElementById('dropzone3');

elDrop3.addEventListener('dragover', function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	elDrop3.classList.add('dropover');
});

elDrop3.addEventListener('dragleave', function(event) {
	elDrop3.classList.remove('dropover');
});

elDrop3.addEventListener('drop', function(event) {
	event.preventDefault();
	elDrop3.classList.remove('dropover');
	files=event.dataTransfer.files;
	document.getElementById('filename3').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i],3);
		document.getElementById('filename3').value+=files[i].name+'\n';
	}//endfor i
});


$("#filein1").change(function(evt){
	files=evt.target.files;
	document.getElementById('filename1').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i]);
		document.getElementById('filename1').value+=files[i].name+'\n';
	}//endfor i
});

$("#filein2").change(function(evt){
	files=evt.target.files;
	document.getElementById('filename2').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i],2);
		document.getElementById('filename2').value+=files[i].name+'\n';
	}//endfor i
});

$("#filein3").change(function(evt){
	files=evt.target.files;
	document.getElementById('filename3').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i],3);
		document.getElementById('filename3').value+=files[i].name+'\n';
	}//endfor i
});


document.getElementById('drawButton').addEventListener('click', function(event){
	Draw();
});

document.getElementById('clearButton').addEventListener('click', function(event){
	ClearDisplay();
});


