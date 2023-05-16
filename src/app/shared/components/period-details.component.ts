import { CommonModule } from '@angular/common'
import { Component, Input, ViewEncapsulation } from '@angular/core'
import { type Period } from 'src/app/shared/services/weather.service'

@Component({
  standalone: true,
  selector: 'app-period-details',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="card">
      <h1>{{ period?.temperature ?? period?.temperatureMin }}º</h1>
      <ul>
        <li>Air quality: {{ period?.aqiTxt || '- -' }}</li>
        <li>
          Precipitation:
          {{
            period?.probabilityOfPrecipitation?.value
              ? [period?.probabilityOfPrecipitation?.value + '%']
              : '- -'
          }}
        </li>
        <li>Humidity: {{ period?.relativeHumidity?.value }}%</li>
        <li>Wind: {{ period?.windSpeed }}</li>
      </ul>
    </div>

    <div class="info" [attr.data-tooltip]="period?.detailedForecast">
      <h3>
        {{ period?.name }}
      </h3>
      <p>
        {{ period?.shortForecast }}
      </p>
    </div>
  `,
  styles: [
    `
      app-period-details {
        display: flex;
        justify-content: space-between;
        align-items: center;

        > {
          .card {
            display: flex;
            align-items: center;
            gap: 1.5rem;

            h1 {
              margin: 0;
              font-weight: 500;
              letter-spacing: -3px;
              font-size: 3.5rem;
            }

            ul {
              margin: 0;
              padding: 0;
              list-style: none;
              font-size: 14px;
              font-weight: 300;
              white-space: nowrap;
            }
          }

          .info {
            text-align: right;

            h3 {
              margin: 0;
              display: inline-block;
            }

            p {
              margin: 0;
              line-height: initial;
            }
          }
        }
      }
    `,
  ],
})
export class PeriodDetailsComponent {
  @Input({ required: true })
  period?: Period | null
}
