// ==UserScript==
// @name        NAVButtons
// @description Add various buttons to Navigator with functions
// @match       *://b2b.wmbird.com/dancik/om/app-mgr/order.jsp*
// @version      2024-01-24
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wmbird.com
// @grant       GM_addStyle
// ==/UserScript==


// Show PO# Button?
var buttonpo = 'on'

// Cash Register Button?
var buttoncash = 'on'

// Transfer Fee Button?
var buttontfee = 'on'

// Refresh Button?
var buttonrefresh = 'on'

// W$ Button
var buttonwsv2 = 'on'

// Routing Button
var buttonrouting = 'on'

// Credit Hold Button
var buttoncredit = 'on'

// Ship and Date Button
var buttonshipdate = 'on'

// Popup to ask to run PO Script on new order load?
var poonload = 'on'

// Automatically run "NONE" Po on Cash Account?
var autopo = 'on'

// Local Cash Account # (6 digits!)
var cashacct = '083006'

// Print Packing List Button
var buttonpack = 'on'

// !!!!!!! DO NOT MODIFY BELOW THIS LINE!!!!!!!!!!
// !!!! STOP !!!!
// !!!! DANGEROUS MONSTERS AHEAD !!!!!

// !!! I WARNED YOU !!!

var orderframe2 = frameElement.contentWindow

function processedtest() {
    if (document.querySelector("[id='title_OrderId']").innerHTML.length == 6) { window.setTimeout(processedtest,300) } else if (document.querySelector("[id='title_OrderId']").innerHTML.length > 10) { procorder() } else { unprocorder() };
}
processedtest()

function unprocorder() {
    setTimeout(() => {
        var zNode = document.createElement ('div');
        zNode.innerHTML = ''
            + '<button id="POButton" type="button">PO#</button>'
            + '<button id="CashReg" type="button">CashReg</button>'
            + '<button id="tfee" type="button">T-Fee</button>'
            + '<button id="refresh" type="button">Refresh Order</button>'
        ;
        zNode.setAttribute ('id', 'myContainer');
        document.body.appendChild (zNode);
        document.getElementById ("POButton").addEventListener ("click", nonepo, false);
        document.getElementById ("CashReg").addEventListener ("click", cashreg, false);
        document.getElementById ("tfee").addEventListener ("click", tfee, false);
        document.getElementById ("refresh").addEventListener ("click", refresh, false);
        if (buttonpo === "off") { orderframe2.document.getElementById('POButton').hide() }
        if (buttoncash === "off") { orderframe2.document.getElementById('CashReg').hide() }
        if (buttontfee === "off") { orderframe2.document.getElementById('tfee').hide() }
        if (buttonrefresh === "off") { orderframe2.document.getElementById('refresh').hide() }
        if (orderframe2.document.getElementById("oeHdr_Box3_1").innerHTML.length == 0) {
            if (orderframe2.document.getElementById("oeHdr_Box1_Ttl").innerHTML === cashacct && autopo === "on") { autononepo() }
            else if (poonload === "on") {
                if (confirm("Run PO Script? Cancel - No") == true) { nonepo() }
            }
        }
    },500)
}

function procorder() {
    setTimeout(() => {
        var zNode = document.createElement ('div');
        zNode.innerHTML = '<button id="CashReg" type="button">CashReg</button>'
            + '<button id="shipdate" type="button">Ship&Date</button>'
            + '<button id="wsv2" type="button">W$</button>'
            + '<button id="tfee" type="button">T-Fee</button>'
            + '<button id="routing" type="button">Routing Change</button>'
            + '<button id="refresh" type="button">Refresh Order</button>'
            + '<button id="packlist" type="button">Print Packing List</button>'
            + '<button id="credithold" type="button">Credit Hold Email</button>'
        ;
        zNode.setAttribute ('id', 'myContainer');
        document.body.appendChild (zNode);
        document.getElementById ("CashReg").addEventListener ("click", cashreg, false);
        document.getElementById ("shipdate").addEventListener ("click", shipdate, false);
        document.getElementById ("tfee").addEventListener ("click", tfee, false);
        document.getElementById ("refresh").addEventListener ("click", refresh, false);
        document.getElementById ("credithold").addEventListener ("click", credithold, false);
        document.getElementById ("wsv2").addEventListener ("click", wsv2, false);
        document.getElementById ("routing").addEventListener ("click", routing, false);
        document.getElementById ("packlist").addEventListener ("click", packlist, false);
        if (orderframe2.document.getElementById('Main_Order_Warning_Message').innerHTML.indexOf("CREDIT HOLD") === -1) { document.getElementById("credithold").hide() }
        if (buttoncash === "off") { orderframe2.document.getElementById('CashReg').hide() }
        if (buttonshipdate === "off") { orderframe2.document.getElementById('shipdate').hide() }
        if (buttontfee === "off") { orderframe2.document.getElementById('tfee').hide() }
        if (buttonrefresh === "off") { orderframe2.document.getElementById('refresh').hide() }
        if (buttoncredit === "off") { orderframe2.document.getElementById('credithold').hide() }
        if (buttonwsv2 === "off") { orderframe2.document.getElementById('wsv2').hide() }
        if (buttonrouting === "off") { orderframe2.document.getElementById('routing').hide() }
        if (buttonpack === "off") { orderframe2.document.getElementById('packlist').hide() }
    },500)
}

function nonepo() {
    let poask = window.prompt("Enter PO#/Name","NONE");
    orderframe2.Main.gotoHeader();
    function lcheck() {if (orderframe2?.frames[1]?.document.getElementById("parm_branchid") === null) { window.setTimeout(lcheck,300) }
                       else {orderframe2.frames[1].document.getElementById("parm_customerpo").value=poask;
                             orderframe2.frames[1].document.getElementById("parm_jobname").value='EBS2024';
                             orderframe2.frames[1].Main.update() }};
    lcheck()
}
function autononepo() {
    orderframe2.Main.gotoHeader();
    function lcheck() {if (orderframe2?.frames[1]?.document.getElementById("parm_branchid") === null) { window.setTimeout(lcheck,300) }
                       else {orderframe2.frames[1].document.getElementById("parm_customerpo").value='NONE';
                             orderframe2.frames[1].document.getElementById("parm_jobname").value='EBS2024';
                             orderframe2.frames[1].Main.update() }};
    lcheck()
}
function cashreg() {
    if (orderframe2.document.getElementById("oeHdr_Box3_1").innerHTML.length == 0) {
        orderframe2.Main.gotoHeader();
        function lcheck() {if (orderframe2?.frames[1]?.document.getElementById("parm_branchid") === null) { window.setTimeout(lcheck,300) }
                           else { orderframe2.frames[1].document.getElementById("parm_customerpo").value="NONE";
                                 orderframe2.frames[1].document.getElementById("parm_jobname").value="EBS2024";
                                 orderframe2.frames[1].Main.update(); window.setTimeout(endorder,1000) }};
        lcheck(); }
    else { endorder() };
    function endorder() { if (confirm("Credit Card?") == true) { orderframe2.Main.showCashRegister();
                                                                function lcheck2() { if (orderframe2?.document.querySelector("[name$='paymethod']") === null) { window.setTimeout(lcheck2,500) }
                                                                                    else { setTimeout(() => { orderframe2.$j("[name$='paymethod']").select2("open");
                                                                                                             orderframe2.$j("[name$='paymethod']").val("ZZ").trigger("change");
                                                                                                             orderframe2.$j("[id$='SendToDevice']").click() }, 1000) } };
                                                                lcheck2(); }
                         else { orderframe2.Main.showCashRegister() }
                        }
}

var observer = new MutationObserver(function(mutations) {
    if (document.contains($(document.querySelector("[id^='CashReg_PopupWdw']")))) {
        setTimeout(() => {
            if ($(document?.querySelector("[id^='CashReg_PopupWdw']")) === null) {} else {
                setTimeout(() => {
                    if ($(document.querySelector("[id='myContinue']"))) {} else {
                        var zNode = document.createElement ('div');
                        zNode.innerHTML = '<button id="CProcess" type="button">Continue => Process => Print => Refresh</button><button id="nopay" type="button">Apply No Payment</button><button id="ccvt" type="button">Open CardConnect Virtual Terminal</button>';
                        zNode.setAttribute ('id', 'myContinue');
                        $(document.querySelector("[id^='CashReg_PopupWdw']").appendChild (zNode));
                        document.getElementById ("CProcess").addEventListener ("click", cprocess, false);
                        document.getElementById ("nopay").addEventListener ("click", nopay, false);
                        document.getElementById ("ccvt").addEventListener ("click", ccvt, false);
                    }},500)}
        },500)}
})

observer.observe(document, {childList: true, subtree: true})

function nopay() {

    orderframe2.$j("[id$='_Bttn_ClearPayment']").click()
    orderframe2.document.querySelector("[id$='_cashier_code']").value=1022
    orderframe2.$j("[name$='paymethod']").select2("open");
    orderframe2.$j("[name$='paymethod']").val("NP").trigger("change");
    orderframe2.document.querySelector("[value='C']").checked = true
    orderframe2.$j("[id$='_Bttn_ApplyPayment']").click()
}

function cprocess() {
    var contbutton = orderframe2.document.querySelector('[id$="_Bttn_Continue"]').id;
    orderframe2.document.getElementById(contbutton).click();
    function pcheck() { if (orderframe2?.document.getElementById('parm_printoptionF01') === null) { window.setTimeout(pcheck,300) }
                       else { var subbutton = orderframe2.document.querySelector('[id$="_SubmitBttn"]').id;
                             orderframe2.document.getElementById('parm_printoptionF01').click();
                             orderframe2.document.getElementById(subbutton).click();
                             setTimeout(() => { orderframe2.location.reload() },2500)}
                      }
    pcheck();
}

function shipdate() {
    orderframe2.$App.Fire("order-status", { orderid: orderframe2.Main.record.header.orderid, referenceid: orderframe2.Main.record.header.reference, entereddate: orderframe2.Main.record.header.enterdate || Main.record.header.entereddate,orderdefid: orderframe2.Main.record.header.order_definition_id});
    function updateship() { orderframe2.document.querySelector("[class^='update_all']").click();
                           orderframe2.document.querySelector("[name^='shipdate_all']").value=moment().format("MM/DD/YY");
                           orderframe2.document.querySelector("[name^='status_all']").value="S";
                           orderframe2.document.querySelector("[name='submit']").click();
                           setTimeout(() => { orderframe2.document.querySelector("[id$='_popupCloser']").click() },1000);}
    window.setTimeout(updateship,1000);
}

function tfee() {
    orderframe2.Main.putIntoEditMode();
    orderframe2.Main.openMsgLines(9966);
    setTimeout(() => { orderframe2.document.getElementById('parm_message_6').value="...";
                      orderframe2.document.getElementById('parm_message_7').value="...";
                      orderframe2.document.getElementById('parm_messageprice_6').value="";
                      orderframe2.document.getElementById('parm_messageprice_7').value="";
                      orderframe2.document.getElementById('parm_messagecost_6').value="";
                      orderframe2.document.getElementById('parm_messagecost_7').value="";
                      orderframe2.document.getElementById('parm_messageglid_6').value="";
                      orderframe2.document.getElementById('parm_messageglid_7').value="";
                      orderframe2.document.getElementById('parm_messagecostctr_6').value="";
                      orderframe2.document.getElementById('parm_messagecostctr_7').value="";
                      orderframe2.document.querySelector('[id^="MessageLines_SaveButton"]').click()
                      setTimeout(() => {
                          if (document.querySelector("[id='title_OrderId']").innerHTML.length == 14) {
                              if (confirm("Exit Order? Cancel = No") == true) {
                                  setTimeout(() => { new orderframe2.PrintOrderOptions_Popup({parm_referenceid: orderframe2.Main.record.header.reference,parm_orderid: orderframe2.Main.record.header.orderid,editmode: orderframe2.Main.settings.editMode}, { beforeOpen: function() { orderframe2.Dancik.Blanket.InProcess.kill();},onComplete: orderframe2.Main.afterOrderComplete,afterSubmit: function() {orderframe2.Main.settings.fromWidget ? $App.Fire("kill_active_session") : orderframe2.Main.close();}});
                                                    setTimeout(() => {
                                                        var subbutton = orderframe2.document.querySelector("[id$='_SubmitBttn']").id;
                                                        orderframe2.document.getElementById("parm_printoptionF12").click();
                                                        orderframe2.document.getElementById(subbutton).click();
                                                        setTimeout(() => { orderframe2.location.reload()
                                                                         },1000)
                                                    },1000)
                                                   },1000)
                              }
                          }},1000)
                     },1000)
}

function packlist() {
    new PrintOrderOptions_Popup({
        parm_referenceid: Main.record.header.reference,
        parm_orderid: Main.record.header.orderid,
        fromEndOrder: !1,
        editmode: Main.settings.editMode,
        forUnprocessedOrder: !Main.record.header.orderid || Main.record.header.orderid.isEmpty()
    });
    setTimeout(() => {
        var subbutton = orderframe2.document.querySelector("[id$='_SubmitBttn']").id;
        orderframe2.document.getElementById("parm_printoptionF11").click();
        orderframe2.document.getElementById(subbutton).click();
        setTimeout(() => {
            var subbutton2 = orderframe2.document.querySelector("[id$='_AdditionalSubmitBttn']").id;
            orderframe2.document.getElementById(subbutton).click();

            orderframe2.location.reload()
        },500)
    },500)
}

function refresh() { orderframe2.location.reload() }

function credithold() {
    var order = orderframe2.document.getElementById("title_OrderId").innerHTML;
    var acct = orderframe2.document.getElementById("account-bill-name").innerHTML;
    var acct2 = acct.replace(/&amp;/g, '%2526');
    window.open("mailto:finsrv@sddholdings.com?subject=Credit%20Hold%20Release%20for%20" + order + "&body=May%20I%20please%20get%20" + order + "%20for%20" + acct2 + "%20Released?%20%20Thanks!!");
}

function wsv2() {
    var ordernum = orderframe2.document.getElementById("parm_orderid").value
    //    var wsv = window.open('https://b2b.wmbird.com/dancik/warehouse/app-wsr/index2.jsp','wsv','toolbar=no','location=no','status=no','menubar=no','scrollbars=yes','resizable=yes','width=600','height=250')
    var wsv = window.open('https://b2b.wmbird.com/dancik/warehouse/app-wsr/index2.jsp','wsv','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1050,height=650')
    setTimeout(() => {
        wsv.WSR.showChangeShippingInfo()
        var date = new Date();
        var datestring = ("0" + (date.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date.getDate().toString()).substr(-2) + "/" + (date.getFullYear().toString()).substr(2)
        wsv.$j("input[name='addorder']").val(ordernum);
        wsv.$j("[id='add_order']").click()
        function pcheck() { if (wsv?.document.getElementById("new_ship_date") === null) { window.setTimeout(pcheck,300) }
                           else {
                               setTimeout(() => {
                                   wsv.$j("[id='new_ship_date']").val(datestring)
                                   wsv.$j("[name='new_ship_via']").val("WC")
                                   wsv.$j("[name='new_truck_route']").val("W$")
                                   wsv.$j("[id$='_Button_save']").click()
                                   setTimeout(() => { wsv.window.close();refresh() },1000)
                               },500)
                           }
                          }
        pcheck()
    },1000)
}
function routing() {
    var ordernum = orderframe2.document.getElementById("parm_orderid").value
    var wsv = window.open('https://b2b.wmbird.com/dancik/warehouse/app-wsr/index2.jsp','wsv','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1050,height=650')
    setTimeout(() => {
        wsv.WSR.showChangeShippingInfo()
        var date = new Date();
        var datestring = ("0" + (date.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date.getDate().toString()).substr(-2) + "/" + (date.getFullYear().toString()).substr(2)
        wsv.$j("input[name='addorder']").val(ordernum);
        wsv.$j("[id='add_order']").click()
    },500)
}

function ccvt() {
    var ccvt = window.open('https://cardpointe.com/account/#/virtualterminal','ccvt')
    }

//--- Style our newly added elements using CSS.
GM_addStyle ( `
    #myContainer {
        position:               fixed;
        top:                    0;
        left:                   600px;
        font-size:              15px;
        background:             beige;
        border:                 1px outset black;
        margin:                 0px;
        opacity:                0.9;
        z-index:                1100;
        padding:                0px 0px;
    }
    #myContainer p {
        color:                  red;
        background:             white;
    }
` );
