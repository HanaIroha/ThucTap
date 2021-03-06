import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { ProductService } from 'app/service/product.service';
import { CommonModule, CurrencyPipe} from '@angular/common';
import { ProducerService } from 'app/service/producer.service';
import { Producer } from 'app/admin/producers/producer.model';
import { Product } from 'app/admin/products/product.model';

@Component({
  selector: 'jhi-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  producers: Producer[];

  imagePath = "\\content\\imageStorage\\";
  defaultImage = "\\content\\imageStorage\\default.jpg";

  defaultSort = "id_product,asc";
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  products: Product[] | null = null;

  constructor(
    private productService: ProductService,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public currencyPipe : CurrencyPipe,
    private producerService: ProducerService,
    ) {}

  ngOnInit(): void {
    this.producerService.getAll().subscribe(res=>{
      this.producers = res;
    })
    
    this.handleNavigation();
  }

  trackIdentity(index: number, item: Product): number {
    return item.idProduct!;
  }

  deleteCategory(filterKey,filterProducer,filterPrice,filterRam,filterRom,idProduct): void {
    this.productService.delete(idProduct).subscribe(res => {});
    this.router.navigate(['./product'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.page,
        sort: `${this.predicate},${this.ascending ? ASC : DESC}`,
        f1: filterKey,
        f2: filterProducer,
        f3: filterPrice,
        f4: filterRam,
        f5: filterRom,
      },
    });
  }

  loadAll(filterKey?, filterProducer?, filterPrice?, filterRam?, filterRom?): void {
    this.isLoading = true;
    this.productService
      .queryActive({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
      },filterKey, filterProducer,filterPrice,filterRam,filterRom)
      .subscribe({
        next: (res: HttpResponse<Product[]>) => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers);
        },
        error: () => (this.isLoading = false),
      });
  }

  transition(filterKey,filterProducer,filterPrice,filterRam,filterRom): void {
    this.router.navigate(['./product'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.page,
        sort: `${this.predicate},${this.ascending ? ASC : DESC}`,
        f1: filterKey,
        f2: filterProducer,
        f3: filterPrice,
        f4: filterRam,
        f5: filterRom,
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
      this.loadAll(params.has('f1')?params.get('f1'):0,params.has('f2')?params.get('f2'):0,params.has('f3')?params.get('f3'):0,params.has('f4')?params.get('f4'):0,params.has('f5')?params.get('5'):0);
    });
  }

  private sort(): string[] {
    const result = [`${this.predicate},${this.ascending ? ASC : DESC}`];
    if (this.predicate !== 'id_product') {
      result.push('id_product');
    }
    return result;
  }

  private onSuccess(products: Product[] | null, headers: HttpHeaders): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.products = products;
  }

}
