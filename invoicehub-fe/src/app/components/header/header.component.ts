import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

/**
 * Header / Navigation Bar Component.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  headerTitle:string = "Invoice"

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
