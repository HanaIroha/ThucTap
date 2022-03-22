import { Order } from 'app/checkout/order.model';
import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { OrderService } from 'app/service/order.service';
import { OrderDetail } from 'app/checkout/orderDetail.model';
import { NumericLiteral } from 'typescript';

@Component({
  selector: 'jhi-userorderhistory',
  templateUrl: './userorderhistory.component.html',
  styleUrls: ['./userorderhistory.component.scss']
})
export class UserorderhistoryComponent implements OnInit {

  defaultSort = "created_at,desc";
  isLoading = false;
  totalItems = 0;
  itemsPerPage = 10;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  orders: Order[] | null = null;
  ordervalue: number[]=[];
  statusOption: string;
  userlogin: string;

  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    ) {}

  ngOnInit(): void {
    this.handleNavigation();
  }

  trackIdentity(index: number, item: Order): number {
    return item.idOrder!;
  }

  setStatus(id,status):void{
    this.orderService.setOrderStatus(id,status).subscribe(res=>{});
    location.reload();
  }

  deleteCategory(idOrder): void {
    this.orderService.delete(idOrder).subscribe(res => {});
  }

  loadAll(): void {
    this.isLoading = true;
    this.orderService
      .queryByLoginParam({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
      },this.userlogin)
      .subscribe({
        next: (res: HttpResponse<Order[]>) => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers);
        },
        error: () => (this.isLoading = false),
      });
  }

  transition(): void {
    this.router.navigate(['./payment'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.page,
        sort: `${this.predicate},${this.ascending ? ASC : DESC}`,
        status: this.statusOption,
      },
    });
  }

  private handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      const page = params.get('page');
      this.page = +(page ?? 1);
      const sort = (params.get(SORT) ?? this.defaultSort).split(',');
      this.predicate = sort[0];
      this.ascending = sort[1] === ASC;
      this.statusOption = params.has('status')?params.get('status'):'4';
      this.userlogin = params.get("login");
      this.loadAll();
    });
  }

  private sort(): string[] {
    const result = [`${this.predicate},${this.ascending ? ASC : DESC}`];
    if (this.predicate !== 'created_at') {
      result.push('created_at');
    }
    return result;
  }

  private onSuccess(orders: Order[] | null, headers: HttpHeaders): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.orders = orders;
    for(let i = 0; i< orders.length;i++){
      this.orderService.getOrderValue(orders[i].idOrder).subscribe(res=>{
        this.ordervalue.push(res)
      })
    };
  }

}
