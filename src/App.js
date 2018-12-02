import React, { Component } from 'react';
import axios from 'axios';

import './App.css';
import Icon from './svg/Icon';
import KHAILogo from './svg/KHAILogo';
import Device from './svg/Device';
import QR from './svg/QR';
import Flash from './svg/Flash';
import WarningIcon from './svg/WarningIcon';
import ChartistGraph from 'react-chartist';

const API_URL = 'https://liquid-api.herokuapp.com';

class App extends Component {
  state = {
    online: null,
    warning: null,
    consumptions: {},
    left: 100,
  };

  componentDidMount() {
    this.getOnlineStatus();
    this.getWarningStatus();
    this.getConsumptions();

    setInterval(() => {
      this.getOnlineStatus();
      this.getWarningStatus();
      this.getConsumptions();
    }, 10 * 1000);
  }

  getOnlineStatus = () => {
    axios.get(API_URL + '/online').then(res => {
      const { data } = res;
      const timeInSec =
        new Date().getTime() / 1000 - new Date(data.date).getTime() / 1000;
      const minutes = timeInSec / 60;

      if (minutes <= 5) {
        this.setState({
          online: true,
        });
      } else {
        this.setState({
          online: false,
        });
      }
    });
  };

  getWarningStatus = () => {
    axios.get(API_URL + '/warning').then(res => {
      const { data } = res;

      if (data) {
        if (data.status !== 'OK') {
          this.setState({
            warning: data.status,
          });
        }
      } else {
        this.setState({
          warning: null,
        });
      }
    });
  };

  getConsumptions = () => {
    axios.get(API_URL + '/consumptions').then(res => {
      const { data } = res;
      const sorted = {};

      if (data) {
        for (let i = 0; i < data.length; i += 1) {
          const date = new Date(data[i].date);

          const dd = date.getDate();
          const mm = date.getMonth() + 1;
          const yyyy = date.getFullYear();

          if (sorted[`${dd}/${mm}/${yyyy}`]) {
            sorted[`${dd}/${mm}/${yyyy}`].poured += +data[i].poured;
          } else {
            sorted[`${dd}/${mm}/${yyyy}`] = {
              poured: +data[i].poured,
              date: `${dd}/${mm}/${yyyy}`,
            };
          }
        }

        this.setState({
          consumptions: sorted,
          left: data[data.length - 1].water_left * 100 / 19,
        });
      }
    });
  };

  getLabels = () => {
    const { consumptions } = this.state;
    const labels = [];
    for (let key in consumptions) {
      labels.push(key);
    }

    return labels;
  };

  getSeries = () => {
    const { consumptions } = this.state;
    const series = [];

    for (let key in consumptions) {
      series.push(consumptions[key].poured);
    }

    return series;
  };

  render() {
    const { online, warning, left } = this.state;

    const simpleLineChartData = {
      labels: this.getLabels(),
      series: [this.getSeries()],
    };

    return (
      <div className="wrapper">
        <header>
          <Icon />
          <h1>LIQUID</h1>
        </header>
        <div className="content">
          <div className="container">
            <Device percent={left} />
          </div>
          <div className="container">
            {online !== null ? (
              <span>
                <Flash color={online ? '#52D471' : '#d4343b'} />{' '}
                {online ? 'ONLINE' : 'OFFLINE'}
              </span>
            ) : null}
            {warning !== null ? (
              <span>
                <WarningIcon color={'#D8D94A'} /> {warning}
              </span>
            ) : null}
            <span className="chart">
              <ChartistGraph data={simpleLineChartData} type={'Line'} />
            </span>
          </div>
          <div className="container">
            <QR />
          </div>
        </div>
        <footer>
          <KHAILogo />
          <span>© Denis Postyka & Yuriy Teslenko</span>
        </footer>
      </div>
    );
  }
}

export default App;
