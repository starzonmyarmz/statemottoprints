document.addEventListener("click",e=>{e.target.closest("[data-toggle-nav]")&&(document.body.classList.toggle("navigation-visible"),document.getElementById("toggle-nav-menu").hidden=!document.getElementById("toggle-nav-menu").hidden,document.getElementById("toggle-nav-x").hidden=!document.getElementById("toggle-nav-x").hidden)}),document.addEventListener("click",e=>{if(!e.target.closest("[data-remove]"))return;const t=e.target.closest("tr").querySelector('input[id$="_qty"]');t.value=0,t.form.submit()}),document.addEventListener("DOMContentLoaded",()=>{document.querySelector(".product-thumbnail")&&document.querySelectorAll(".product-thumbnail").forEach(e=>{e.addEventListener("click",t=>{document.querySelector(".product-thumbnail.selected").classList.remove("selected"),document.querySelector(".product-image img").src=t.currentTarget.dataset.source,e.classList.add("selected")})})}),document.addEventListener("DOMContentLoaded",()=>{if(!document.getElementById("options"))return;const e=document.querySelector(".product-price"),t=/\s*-\s*/g,n=/\s*.00/g;document.querySelector("#options option").dataset.price=e.innerText,document.querySelectorAll("#options option:not(:first-child)").forEach(e=>{e.innerText.includes("$")?(e.dataset.price=e.innerText.split(t)[1].split(n)[0],e.innerText=e.innerText.split(t)[0]):e.dataset.price=document.getElementById("default-price").innerText}),document.getElementById("options").addEventListener("change",t=>{e.innerHTML=t.currentTarget.selectedOptions[0].dataset.price})}),document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("options"),t=new Event("change");if(!e||!e.querySelector("option").innerText.includes(","))return;e.classList.add("options-are-hidden");let n={},l={};e.querySelectorAll("option").forEach(e=>{let t=[];for(let n of e.innerText.split(/\s*,\s*/g)){let[e,d]=n.split(/\s*:\s*/g);t.push(d),l[e]||(l[e]=new Set),l[e].add(d)}n[t.join(", ")]=e.value});let d=[];for(let c of Object.keys(l)){let o=document.createElement("div"),a=document.createElement("div");a.className="selectableable_legend",a.innerHTML=c,o.className="selectableable_fieldset selectableable_"+c,o.appendChild(a),d.push(o);for(let a of l[c]){let l=document.createElement("div"),i=document.createElement("input"),r=document.createElement("label");l.className="selectableable_choice",i.type="radio",i.name="selectableable_"+c,i.value=a,i.id="selectableable_"+a.replace(/\s/,"_"),i.className="selectableable_input",i.addEventListener("click",()=>{let l=d.map(e=>e.querySelector("input:checked").value).join(", ");e.value=n[l],document.getElementById("options").dispatchEvent(t)}),r.className="selectableable_label",r.htmlFor="selectableable_"+a.replace(/\s/,"_"),l.appendChild(i),r.appendChild(document.createTextNode(a)),l.appendChild(r),o.appendChild(l)}document.getElementById("product-options").appendChild(o),o.querySelector("input").checked=!0}});