import { CommonModule } from '@angular/common'
import {
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core'
import { type Period } from 'src/app/shared/services/weather.service'

@Component({
  standalone: true,
  selector: 'app-period-card',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <p>{{ period.shortName }}</p>
    <img [src]="period.icon" [alt]="period.name + ' weather image'" />
    <h5>
      <span *ngIf="period.temperature != null" class="max">
        {{ period.temperature }}º
      </span>
      <span *ngIf="period.temperatureMin != null" class="min">
        {{ period.temperatureMin }}º
      </span>
    </h5>
  `,
  styles: [
    `
      app-period-card {
        display: flex;
        flex-direction: column;
        align-items: center;

        > {
          p {
            margin: 0 0 6px;
            text-align: center;
            font-weight: 400;
          }

          img {
            max-width: 55px;
            border-radius: 8px;
          }

          h5 {
            margin: 10px 0 0;
            display: block;
            font-weight: 400;

            .max {
              margin-right: 6px;
            }

            .min {
              opacity: 0.6;
            }
          }
        }
      }
    `,
  ],
})
export class PeriodCardComponent {
  @Input({ required: true })
  period!: Period
}
