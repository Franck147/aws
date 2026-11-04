import {Component,ElementRef,ViewChild,computed,signal,provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
type Product={id:number;name:string;category:string;description:string;price:number;unit:string;stock:number;badge:string;tone:string;image_url:string};
@Component({selector:'app-root',standalone:true,templateUrl:'./app.html'})
class App {
 @ViewChild('basket') basket!:ElementRef<HTMLDialogElement>;
 readonly products=signal<Product[]>([]);readonly loading=signal(true);readonly error=signal('');
 readonly category=signal('Todos');readonly query=signal('');readonly quantities=signal<Record<number,number>>({});
 readonly categories=computed(()=>['Todos',...new Set(this.products().map(p=>p.category))]);
 readonly filtered=computed(()=>this.products().filter(p=>(this.category()==='Todos'||p.category===this.category())&&(p.name+' '+p.description).toLocaleLowerCase('es').includes(this.query().toLocaleLowerCase('es'))));
 readonly selection=computed(()=>this.products().filter(p=>(this.quantities()[p.id]||0)>0).map(p=>({...p,quantity:this.quantities()[p.id]})));
 readonly count=computed(()=>this.selection().reduce((n,p)=>n+p.quantity,0));readonly total=computed(()=>this.selection().reduce((n,p)=>n+p.price*p.quantity,0));
 constructor(){void this.load();}
 async load(){this.loading.set(true);this.error.set('');try{const r=await fetch('/api/products');if(!r.ok)throw new Error('catalog');const d=await r.json();this.products.set(d.products);}catch{this.error.set('El catálogo no está disponible por el momento. Puedes volver a intentarlo.');}finally{this.loading.set(false);}}
 money(n:number){return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n);}
 add(p:Product){this.quantities.update(q=>({...q,[p.id]:Math.min((q[p.id]||0)+1,p.stock)}));}
 remove(id:number){this.quantities.update(q=>({...q,[id]:Math.max((q[id]||0)-1,0)}));}
 openBasket(){this.basket.nativeElement.showModal();}closeBasket(){this.basket.nativeElement.close();}
 clear(){this.quantities.set({});}
}
bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]}).catch(()=>console.error('No se pudo iniciar EcoMarket'));
