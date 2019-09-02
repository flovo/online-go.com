/*
 * Copyright (C) 2012-2019  Online-Go.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from "react";
import * as moment from "moment";

interface ServerTimeDisplayProperties {}

export class ServerTimeDisplay extends React.Component<ServerTimeDisplayProperties, any> {
    intervalID;
    constructor(props) {
        super(props);
        this.state = {
            time: moment().utcOffset(0).format('dddd, HH:mm:ss')
        };
    }
    componentDidMount() {
        this.intervalID = setInterval(
            () => this.tick(),
            1000
        );
    }
    componentWillUnmount() {
        clearInterval(this.intervalID);
    }
    tick() {
        this.setState({
            time: moment().utcOffset(0).format('dddd, HH:mm:ss')
        });
    }
    isWeekend() {
        if (this.state.time.startsWith("Saturday") || this.state.time.startsWith("Sunday")) {
            return " It is the weekend!"; 
        } 
        else { 
            return " It is not the weekend.";
        }
    }
    render() {
        return (
            <div className="server-time-display">
                <p>
                    <b>
                    Current Server Time is: {this.state.time}.{this.isWeekend()}
                    </b>
                </p>
            </div>
        );
    }
}
