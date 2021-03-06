import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Payment } from 'app/admin/payments/payment.model';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { ImageService } from 'app/service/image.service';
import { OrderService } from 'app/service/order.service';
import { PaymentService } from 'app/service/payment.service';
import { ProducerService } from 'app/service/producer.service';
import { ProductService } from 'app/service/product.service';
import { LocalStorage } from 'ngx-webstorage';
import { Order } from './order.model';
import { OrderDetail } from './orderDetail.model';

@Component({
  selector: 'jhi-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  account: Account | null = null;
  data = [];
  sl:number;
  allPrice:number;
  payments: Payment[];
  paymentMethod:string;
  order = new Order();

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private producerService: ProducerService,
    private paymentService: PaymentService,
    private imageService: ImageService,
    private accountService: AccountService,
    private orderService: OrderService,
  ) { }

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      this.order.login = account.login;
      this.order.name = account.fullname;
      this.order.phone = account.phonenumber;
    });

    this.paymentService.getAll().subscribe(res=>{
      this.payments=res;
      console.log(this.payments);
    })

    this.load();

    }

    load(){
      this.allPrice=0;
      this.sl=0;
      if (!localStorage['cart']) this.data = [];
      else this.data = JSON.parse(localStorage['cart']); 
      if (!(this.data instanceof Array)) this.data = [];
  
      for (let i = 0; i< this.data.length; i++){
        this.sl++;
        this.productService.getOne(this.data[i].id).subscribe(res=>{
          this.data[i].name = res.name;
          this.data[i].image = res.image;
          this.data[i].price = res.salePercent ? (res.price/100*(100-res.salePercent)) : res.price;
          this.allPrice = this.allPrice + this.data[i].price * this.data[i].quantity;
        });
      }
    }
  checkout():void{
    if(this.sl < 1){
      alert("Gi??? h??ng tr???ng");
    }
    else if(typeof this.order.name == 'undefined' || !this.order.name){
      alert("T??n kh??ng ???????c ????? tr???ng");
    }
    else if(typeof this.order.phone == 'undefined' || !this.order.phone){
      alert("S??? ??i???n tho???i kh??ng ???????c ????? tr???ng");
    }
    else if(!this.order.phone.match('^[0-9]')){
      alert('S??? ??i???n tho???i ch??? bao g???m s???');
    }
    else if(typeof this.order.address == 'undefined' || !this.order.address){
      alert("?????a ch??? kh??ng ???????c ????? tr???ng");
    }
    else if(typeof this.order.idPayment == 'undefined' || !this.order.idPayment){
      alert("Vui l??ng ch???n ph????ng th???c thanh to??n");
    }
    else{
      this.orderService.create(this.order).subscribe(res=>{
        for(let i=0;i<this.sl;i++){
          console.log('1')
          let a = new OrderDetail();
          a.idOrder = res.idOrder;
          a.idProduct = this.data[i].id;
          a.price = this.data[i].price;
          a.quantity = this.data[i].quantity;
          this.orderService.createDetails(a).subscribe(res=>{});
        }
        
      })
      alert('?????t h??ng th??nh c??ng! M???t email ???? ???????c g???i v??? h??m th?? c???a b???n!');
      localStorage.removeItem('cart');
      window.history.back();
    }
  }

}
