(this.webpackJsonphyggetime=this.webpackJsonphyggetime||[]).push([[0],{112:function(t,e,a){},113:function(t,e,a){},115:function(t,e,a){},122:function(t,e,a){},125:function(t,e,a){},126:function(t,e,a){},145:function(t,e,a){},148:function(t,e,a){"use strict";a.r(e);var o=a(0),n=a.n(o),s=a(11),i=a.n(s),r=(a(112),a(113),a(20)),c=a(89),u=a(23),h=a(24),l=a(17),w=a(26),d=a(25),p=a(90),b=a(202),m=a(219),g=a(213),v=a(203),y=a(218),j=a(201),S=(a(115),a(198)),f=Object(S.a)({palette:{type:"dark",primary:{main:"#ffffff"},secondary:{main:"#b9f6ca"}}}),O=a(2),C=function(t){Object(w.a)(a,t);var e=Object(d.a)(a);function a(t){var o;return Object(u.a)(this,a),(o=e.call(this,t)).handleChange=o.handleChange.bind(Object(l.a)(o)),o}return Object(h.a)(a,[{key:"createMenuItems",value:function(){return this.props.dropdownOptions.map((function(t){return Object(O.jsx)(y.a,{id:t,value:t,children:"".concat(t)},t)}))}},{key:"handleChange",value:function(t){var e=t.target.value;this.props.handleChange(e)}},{key:"render",value:function(){var t=this.createMenuItems();return Object(O.jsx)("div",{className:"dropdownWrapper",children:Object(O.jsx)(j.a,{theme:f,children:Object(O.jsxs)(b.a,{className:"dropdownSelect",children:[Object(O.jsx)(m.a,{id:"Dropdown_".concat(this.props.dropdownName),color:"primary",style:{fontSize:"16px"},children:this.props.dropdownName}),Object(O.jsx)(g.a,{id:"Dropdown_Select_".concat(this.props.dropdownName),value:this.props.currentSelection,onChange:this.handleChange,children:t})]})})})}}]),a}(o.Component);C.defaultProps={dropdownOptions:[],dropdownName:""};var x=C,k=(a(122),a(64)),M=function(t){Object(w.a)(a,t);var e=Object(d.a)(a);function a(t){var o;return Object(u.a)(this,a),(o=e.call(this,t)).handleChange=o.handleChange.bind(Object(l.a)(o)),o}return Object(h.a)(a,[{key:"createMenuItems",value:function(){var t=this;return this.props.dropdownOptions.map((function(e){var a=t.props.currentSelection in e.children?t.props.currentSelection:"";return Object(O.jsx)(x,{id:"innerDD",dropdownOptions:e.children,dropdownName:e.value,handleChange:t.props.handleChange,currentSelection:a},Object(k.v4)())}))}},{key:"handleChange",value:function(t){var e=t.target.value;this.props.handleChange(e)}},{key:"render",value:function(){var t=this.createMenuItems();return Object(O.jsx)("div",{className:"dropdownWrapper",children:Object(O.jsx)(j.a,{theme:f,children:Object(O.jsxs)(b.a,{className:"dropdownSelect",children:[Object(O.jsx)(m.a,{id:"Dropdown_".concat(this.props.dropdownName),color:"primary",style:{fontSize:"16px"},children:this.props.dropdownName}),Object(O.jsx)(g.a,{id:"Dropdown_Select_".concat(this.props.dropdownName),value:[],input:Object(O.jsx)(v.a,{}),onChange:this.handleChange,children:t})]})})})}}]),a}(o.Component);M.defaultProps={dropdownOptions:[],dropdownName:""};var W=M,N=a(220),H=a(216),F=(a(125),function(t){Object(w.a)(a,t);var e=Object(d.a)(a);function a(){return Object(u.a)(this,a),e.apply(this,arguments)}return Object(h.a)(a,[{key:"render",value:function(){var t=this;return Object(O.jsx)("div",{className:"outerMultiWrap",children:Object(O.jsx)(j.a,{theme:f,children:Object(O.jsxs)(b.a,{className:"multiSelectWrapper",children:[Object(O.jsx)(m.a,{id:"demo-mutiple-checkbox-label",style:{fontSize:"16px"},children:"Background Sounds"}),Object(O.jsx)(g.a,{labelId:"demo-mutiple-checkbox-label",id:"demo-mutiple-checkbox",multiple:!0,value:[],onChange:this.props.handleChange,input:Object(O.jsx)(v.a,{}),renderValue:function(t){return t.join(", ")},children:this.props.sounds.map((function(e){return Object(O.jsxs)(y.a,{value:String(e),children:[Object(O.jsx)(H.a,{checked:t.props.soundSelections.indexOf(e)>-1}),Object(O.jsx)(N.a,{primary:e})]},Object(k.v4)())}))})]})})})}}]),a}(o.Component)),B=(a(126),a(65)),P=a.n(B),A={"Bamboo Forest":"https://www.youtube.com/watch?v=a20ooDY0L0E",Blizzard:"https://www.youtube.com/watch?v=YsmfWkE6FUg","Cafe Jazz & Rain":"https://www.youtube.com/watch?v=c0_ejQQcrwI","Campfire & River":"https://www.youtube.com/watch?v=Ftm2uv7-Ybw","Christmas Music":"https://www.youtube.com/watch?v=9a9GixtqVP4","Disney Piano":"https://www.youtube.com/watch?v=g8NVwN0_mks","Disney Piano 2":"https://www.youtube.com/watch?v=2Mu7LAhxyp8","Disney Springs":"https://www.youtube.com/watch?v=klOe-e9y0_4","EPCOT Area Music":"https://www.youtube.com/watch?v=f7vevAplVYI","Fall Leaves":"https://www.youtube.com/watch?v=aT66uumZ0Zo",Fireplace:"https://youtu.be/UgHKb_7884o?t=607","Forest Sounds":"https://www.youtube.com/watch?v=TOHYkccYfUk","Jungle Sounds":"https://youtu.be/g45jXV-fg2E?t=393","Hollywood Studios Area Music":"https://www.youtube.com/watch?v=NmSSUYMzQpY","Large Waterfall":"https://www.youtube.com/watch?v=Qo3OM5sPUPM","Light Rain":"https://www.youtube.com/watch?v=7JyE47-Ykjo","Light Snow":"https://www.youtube.com/watch?v=vz91QpgUjFc","Magic Kingdom Area Music":"https://www.youtube.com/watch?v=CYGAXigR_Z8","Mandalorian Music":"https://www.youtube.com/watch?v=A872Muk-gYA","Narnia Winter Music":"https://www.youtube.com/watch?v=5RHTt4_XVVU","Nighttime Forest":"https://www.youtube.com/watch?v=PVV4-2G0t3k","Small Waterfall":"https://youtu.be/02NQkhbjALg?t=388","Snow & Wind":"https://www.youtube.com/watch?v=oakA7RLvmWs","Soft Waves":"https://www.youtube.com/watch?v=ec_xGmM_tJc",Stream:"https://youtu.be/UJZxtO9XNno?t=375","Summer Night":"https://www.youtube.com/watch?v=eKmRkS1os7k",Thunder:"https://www.youtube.com/watch?v=yMRoNNKWuqQ","Tropical House":"https://www.youtube.com/watch?v=0D0LMWf93pU",Waves:"https://www.youtube.com/watch?v=Nep1qytq9JM",Wind:"https://www.youtube.com/watch?v=lWULd19LvaY","Winter at Hogwarts":"https://www.youtube.com/watch?v=oE-pXV-G9aY","Wizarding World Area Music":"https://www.youtube.com/watch?v=F6am4iEDez0",Yiruma:"https://www.youtube.com/watch?v=9L5cdoBPryY"},D=function(t){Object(w.a)(a,t);var e=Object(d.a)(a);function a(){return Object(u.a)(this,a),e.apply(this,arguments)}return Object(h.a)(a,[{key:"render",value:function(){return Object(O.jsx)(P.a,{url:A[this.props.sound],width:"0px",height:"0px",loop:!0,controls:!1,volume:this.props.volume,playing:this.props.playing})}}]),a}(o.Component),R=a(221),T=a(206),K=a(215),L=a(95),Y=a.n(L),z=a(98),E=a.n(z),G=(a(145),function(t){Object(w.a)(a,t);var e=Object(d.a)(a);function a(){var t;return Object(u.a)(this,a),(t=e.call(this)).onChange=t.onChange.bind(Object(l.a)(t)),t}return Object(h.a)(a,[{key:"onChange",value:function(t){var e=t.target.value/100;this.props.onChange(this.props.index,e)}},{key:"render",value:function(){return Object(O.jsx)("div",{className:"slider",children:Object(O.jsxs)(R.a,{sx:{width:280},children:[this.props.sound,Object(O.jsxs)(T.a,{spacing:2,direction:"row",sx:{mb:1},alignItems:"center",children:[Object(O.jsx)(Y.a,{}),Object(O.jsx)(K.a,{"aria-label":"Volume",value:100*this.props.volume,onChange:this.onChange,min:0,max:100}),Object(O.jsx)(E.a,{})]})]})})}}]),a}(o.Component)),V={"Autumn Forest":"https://www.youtube.com/watch?v=IadsLclBOS8","Autumn River":"https://www.youtube.com/watch?v=6uhRxK_EOm4","Fall Coffee Shop":"https://youtu.be/VMAPTo7RVCo?t=1287","Halloween Party":"https://youtu.be/LmCg6V8e8Jw?t=42","Halloween Porch":"https://youtu.be/cykFvQ2Y8sM?t=55","Haunted Hogwarts":"https://www.youtube.com/watch?v=lQ12THXbUE0","Hogwarts Fall Courtyard":"https://www.youtube.com/watch?v=JVAbQvUSUIY","Magic Kingdom Halloween":"https://www.youtube.com/watch?v=CYGAXigR_Z8","Nighttime Porch":"https://www.youtube.com/watch?v=-gKvayYQVcg","Thanksgiving Kitchen":"https://youtu.be/Xl4aD7b2l-w?t=7","Witch's Kitchen":"https://www.youtube.com/watch?v=900GFG30Fzg","Christmas at the Burrow":"https://www.youtube.com/watch?v=NSw8epNSVRI","Christmas Coffee Shop":"https://youtu.be/9a9GixtqVP4?t=313","Christmas Fireplace":"https://youtu.be/nZHZGKADNRw?t=102","Christmas Porch":"https://youtu.be/hQXOYApD-Rs?t=2349",Hogsmeade:"https://www.youtube.com/watch?v=bi4VmbqFJ2Y","Magic Kingdom Christmas":"https://www.youtube.com/watch?v=WXccs2azATQ","Magic Kingdom Cristmas 2":"https://www.youtube.com/watch?v=t4GSiJx6Glo","Snow Fall":"https://youtu.be/jh_KFTYJnDo?t=567","The Yule Ball":"https://www.youtube.com/watch?v=tTfr-0qa3OQ","Winter Chalet":"https://youtu.be/111hKC_4LuY?t=234","Winter Coffee Shop":"https://youtu.be/twM7ulKpPjI?t=323","Winter Fireplace":"https://www.youtube.com/watch?v=WjOJis4UR44","Winter Fireplace 2":"https://www.youtube.com/watch?v=oakA7RLvmWs","Winter Forest":"https://youtu.be/eS2ssUROF5o?t=215","Cherry Blossoms":"https://youtu.be/o6tmxJPcnsg?t=6","EPCOT Flower Garden Festival":"https://www.youtube.com/watch?v=seAjL2U6N6o","English Forest":"https://www.youtube.com/watch?v=IsPBplWLImI","Greek Seaside":"https://youtu.be/N7SvKKxpVBc?t=131","Hogwarts Spring Scene":"https://www.youtube.com/watch?v=QQRHobcT1_A","Mountain View":"https://youtu.be/qRTVg8HHzUo?t=22","Spring Cafe 1":"https://www.youtube.com/watch?v=MbiTgRzP_2I","Spring Cafe 2":"https://www.youtube.com/watch?v=-aL6ig2lxrE","Spring Kitchen":"https://youtu.be/m7DW3jxGa8U?t=15","Sunflower Meadow":"https://youtu.be/ipf7ifVSeDU?t=6",Aulani:"https://www.youtube.com/watch?v=pmW5gjbCggM","Beach Bonfire":"https://youtu.be/Y1y9GAjuSt8?t=24","Hawaiian Beach":"https://youtu.be/e2tWiI2ipjU?t=45","Hawaiian Sunset":"https://youtu.be/q3J0H5SAhJY?t=18",Motunui:"https://www.youtube.com/watch?v=gWxNBVo2gZc","Night Cafe":"https://www.youtube.com/watch?v=BA50F2aq9D8","Sea Turtles in Hawaii":"https://youtu.be/yLuEx-XH3Uc?t=530","Summer Night":"https://youtu.be/SN3xlcjbvUo?t=164","Summer Night Beach House":"https://youtu.be/V65kcs57yhY?t=6","Summer Night Terrace":"https://www.youtube.com/watch?v=yBzR0OL9cqA","Summer Picnic":"https://youtu.be/wSZ0j6eBRpg?t=158","Tropical Beach":"https://www.youtube.com/watch?v=DGIXT7ce3vQ",Waterfall:"https://www.youtube.com/watch?v=V1RPi2MYptM","Disney's Coral Reef":"https://youtu.be/JxiB4y43uN8?t=139","Disney Springs":"https://youtu.be/Szetlwwd6jw?t=42",Encanto:"https://youtu.be/eeorll3-Ugw?t=11","Kiss Goodnight":"https://www.youtube.com/watch?v=QqGjuloQGgo","Magic Kingdom":"https://www.youtube.com/watch?v=vnJEjMdQoDw","Magic Kingdom Sunset":"https://www.youtube.com/watch?v=EoZCMGPtZlM","Pirate of the Caribbean":"https://youtu.be/eSX47ue269Q?t=165","Christmas Great Hall":"https://youtu.be/_v4cgUVBsi4?t=60","Diagon Alley Night":"https://www.youtube.com/watch?v=v0haKQUgxYE","Hogwarts Express":"https://youtu.be/daCu-ku1v8E?t=141","Hogwarts Library":"https://www.youtube.com/watch?v=20XE6GM7xWo","Hogwarts Library 2":"https://youtu.be/oI9bqFUBJ9E?t=28","Potions Class":"https://www.youtube.com/watch?v=J8K3nPP4V-Y","Weasley's Wizard Wheezes":"https://www.youtube.com/watch?v=WxB6hbba8cY",Aquarium:"https://www.youtube.com/watch?v=dBsicD0ItD0","Coral Reef":"https://www.youtube.com/watch?v=tADnCEpbPI8","221B Baker Street":"https://www.youtube.com/watch?v=wFrIeXGXEco"},U=[{value:"Fall",children:["Autumn Forest","Autumn River","Fall Coffee Shop","Halloween Party","Halloween Porch","Haunted Hogwarts","Hogwarts Fall Courtyard","Magic Kingdom Halloween","Nighttime Porch","Thanksgiving Kitchen","Witch's Kitchen"]},{value:"Winter",children:["Christmas at the Burrow","Christmas Great Hall","Christmas Coffee Shop","Christmas Fireplace","Christmas Porch","Hogsmeade","Magic Kingdom Christmas","Magic Kingdom Cristmas 2","Snow Fall","The Yule Ball","Winter Chalet","Winter Coffee Shop","Winter Fireplace","Winter Fireplace 2","Winter Forest"]},{value:"Spring",children:["Cherry Blossoms","EPCOT Flower Garden Festival","English Forest","Greek Seaside","Hogwarts Spring Scene","Mountain View","Spring Cafe 1","Spring Cafe 2","Spring Kitchen","Sunflower Meadow"]},{value:"Summer",children:["Aulani","Beach Bonfire","Hawaiian Beach","Hawaiian Sunset","Night Cafe","Sea Turtles in Hawaii","Summer Night","Summer Night Beach House","Summer Night Terrace","Summer Picnic","Tropical Beach","Waterfall"]},{value:"Disney",children:["Aulani","Coral Reef","Disney Springs","Encanto","EPCOT Flower Garden Festival","Kiss Goodnight","Magic Kingdom","Magic Kingdom Christmas","Magic Kingdom Cristmas 2","Magic Kingdom Halloween","Magic Kingdom Sunset","Motunui","Pirate of the Caribbean"]},{value:"Harry Potter",children:["Christmas at the Burrow","Christmas Great Hall","Diagon Alley Night","Haunted Hogwarts","Hogsmeade","Hogwarts Express","Hogwarts Fall Courtyard","Hogwarts Library","Hogwarts Library 2","Hogwarts Spring Scene","Potions Class","The Yule Ball","Weasley's Wizard Wheezes"]},{value:"Other",children:["Aquarium","Coral Reef","221B Baker Street"]}],I="Base Sound",_=[I,"Bamboo Forest","Blizzard","Cafe Jazz & Rain","Campfire & River","Christmas Music","Disney Piano","Disney Piano 2","Disney Springs","EPCOT Area Music","Fall Leaves","Fireplace","Forest Sounds","Jungle Sounds","Hollywood Studios Area Music","Large Waterfall","Light Rain","Light Snow","Magic Kingdom Area Music","Mandalorian Music","Narnia Winter Music","Nighttime Forest","Small Waterfall","Snow & Wind","Soft Waves","Stream","Summer Night","Thunder","Tropical House","Waves","Wind","Winter at Hogwarts","Wizarding World Area Music","Yiruma"],J=function(t){Object(w.a)(a,t);var e=Object(d.a)(a);function a(){var t;return Object(u.a)(this,a),(t=e.call(this)).state={background:"",backgroundURL:"",play:!0,selectedSounds:[],width:window.screen.availWidth,height:window.screen.availHeight,baseSound:{enabled:!1,volume:1},openSide:!1},t.play=t.play.bind(Object(l.a)(t)),t.pause=t.pause.bind(Object(l.a)(t)),t.handleBackgroundDropdown=t.handleBackgroundDropdown.bind(Object(l.a)(t)),t.handleSoundChange=t.handleSoundChange.bind(Object(l.a)(t)),t.getSoundComponents=t.getSoundComponents.bind(Object(l.a)(t)),t.onResize=Object(p.debounce)(t.onResize.bind(Object(l.a)(t)),200),t.arrowClicked=t.arrowClicked.bind(Object(l.a)(t)),t.volumeChange=t.volumeChange.bind(Object(l.a)(t)),t}return Object(h.a)(a,[{key:"getDropDown",value:function(){return Object(O.jsx)(W,{id:"dropdownAddRecipe",dropdownOptions:U,dropdownName:"Select Background",handleChange:this.handleBackgroundDropdown,currentSelection:this.state.background})}},{key:"handleBackgroundDropdown",value:function(t){this.setState({background:t,backgroundURL:V[t]})}},{key:"getMultiSelect",value:function(){return Object(O.jsx)(F,{id:"dropdownAddRecipe",sounds:_,dropdownName:"Select Background",soundSelections:this.state.selectedSounds.map((function(t){return t.sound})),handleChange:this.handleSoundChange})}},{key:"handleSoundChange",value:function(t){var e=t.target.value[0];if(e===I){var a={enabled:!this.state.baseSound.enabled,volume:1};this.setState({baseSound:a})}var o,n=-1,s=0,i=Object(c.a)(this.state.selectedSounds);try{for(i.s();!(o=i.n()).done;){if(o.value.sound===e){n=s;break}s++}}catch(l){i.e(l)}finally{i.f()}var u=Object(r.a)(this.state.selectedSounds);if(n>-1)u.splice(n,1);else{var h={sound:e,volume:1};u.push(h)}this.setState({selectedSounds:u})}},{key:"pause",value:function(){this.setState({play:!1})}},{key:"play",value:function(){this.setState({play:!0})}},{key:"getSoundComponents",value:function(){var t=this;return this.state.selectedSounds.map((function(e){return e.sound!==I?Object(O.jsx)(D,{sound:e.sound,volume:e.volume,playing:t.state.play}):null}))}},{key:"onResize",value:function(t){this.setState({width:t.target.outerWidth,height:t.target.outerHeight})}},{key:"arrowClicked",value:function(){this.setState({openSide:!this.state.openSide})}},{key:"volumeChange",value:function(t,e){var a=Object(r.a)(this.state.selectedSounds),o=a[t];if(a.splice(t,1),o.volume=e,a.splice(t,0,o),o.sound===I){var n=this.state.baseSound;n.volume=e,this.setState({selectedSounds:a,baseSound:n})}else this.setState({selectedSounds:a})}},{key:"getSliders",value:function(){var t=this,e=-1;return this.state.selectedSounds.map((function(a){return e+=1,Object(O.jsx)(G,{index:e,onChange:t.volumeChange,sound:a.sound,volume:a.volume})}))}},{key:"getSidePanel",value:function(){if(this.state.openSide){var t=this.getSliders();return Object(O.jsxs)("div",{children:[Object(O.jsxs)("div",{className:"sideBar",children:["Volume Mixer",Object(O.jsx)("div",{className:"sliderTop",children:t})]}),Object(O.jsx)("svg",{height:"50",width:"50",className:"circleIn",children:Object(O.jsx)("circle",{cx:"25",cy:"25",r:"25",fill:"white"})}),Object(O.jsx)("img",{src:"https://www.shareicon.net/data/512x512/2015/10/17/657431_arrows_512x512.png",alt:"",onClick:this.arrowClicked,className:"arrowIn",width:"50",height:"50"})]})}return Object(O.jsxs)("div",{onClick:this.arrowClicked,children:[Object(O.jsx)("svg",{height:"50",width:"50",className:"circleOut",children:Object(O.jsx)("circle",{cx:"25",cy:"25",r:"25",fill:"white"})}),Object(O.jsx)("img",{src:"https://www.shareicon.net/data/512x512/2015/10/17/657431_arrows_512x512.png",alt:"",className:"arrowOut",width:"50",height:"50"})]})}},{key:"render",value:function(){var t=this,e=this.getDropDown(),a=this.getMultiSelect(),o=this.getSoundComponents(),n=this.getSidePanel();return window.addEventListener("resize",(function(e){return t.onResize(e)})),Object(O.jsxs)("div",{className:"outerWrapper",width:this.state.width,height:this.state.height,children:[Object(O.jsxs)("div",{className:"videoWrapper",height:this.state.height,width:this.state.width,children:[Object(O.jsx)(P.a,{url:this.state.backgroundURL,width:this.state.width+"px",height:this.state.height+"px",loop:!0,controls:!1,muted:!this.state.baseSound.enabled,volume:this.state.baseSound.volume,playing:!0,onPause:this.pause,onPlay:this.play}),o]}),Object(O.jsxs)("div",{className:"playerOptions",width:this.state.width+"px",children:[Object(O.jsx)("div",{className:"playerTitle",width:this.state.width+"px",children:"Hygge Time"}),e,a]}),n]})}}]),a}(o.Component);var Q=function(){return Object(O.jsx)("div",{children:Object(O.jsx)(J,{})})},X=function(t){t&&t instanceof Function&&a.e(3).then(a.bind(null,222)).then((function(e){var a=e.getCLS,o=e.getFID,n=e.getFCP,s=e.getLCP,i=e.getTTFB;a(t),o(t),n(t),s(t),i(t)}))};i.a.render(Object(O.jsx)(n.a.StrictMode,{children:Object(O.jsx)(Q,{})}),document.getElementById("root")),X()}},[[148,1,2]]]);
//# sourceMappingURL=main.241a2008.chunk.js.map