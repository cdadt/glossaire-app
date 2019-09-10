import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterContentInit {

  @Input() appAutoFocus: boolean;

  constructor(private elem: ElementRef) {
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.elem.nativeElement.focus();
    }, 200);
  }

}
