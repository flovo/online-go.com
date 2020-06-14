/*
 * Copyright (C) 2012-2020  Online-Go.com
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
import {Link} from "react-router-dom";
import {browserHistory} from "ogsHistory";
import {_, ngettext, interpolate} from "translate";
import * as preferences from "preferences";
import {Goban} from "goban";
import {termination_socket} from "sockets";
import * as data from "data";
import {PersistentElement} from "PersistentElement";
import {rankString, getUserRating} from "rank_utils";
import { Clock } from 'Clock';

interface MiniGobanProps {
    id: number;
    width?: number;
    height?: number;
    displayWidth?: number;
    black: any;
    white: any;
    onUpdate?: () => void;
    json?: any;
    noLink?: boolean;
}

export class MiniGoban extends React.Component<MiniGobanProps, any> {
    public goban_div:HTMLDivElement;
    goban;

    constructor(props) {
        super(props);
        this.state = {
            white_points: "",
            black_points: "",
        };

        this.goban_div = document.createElement('div');
        this.goban_div.className = 'Goban';
    }

    componentDidMount() {
        this.initialize();
    }
    componentWillUnmount() {
        this.destroy();
    }
    componentDidUpdate(prev_props) {
        if (prev_props.id !== this.props.id) {
            this.destroy();
            this.initialize();
        }
    }

    initialize() {

        this.goban = new Goban({
            "board_div": this.goban_div,
            "draw_top_labels": false,
            "draw_bottom_labels": false,
            "draw_left_labels": false,
            "draw_right_labels": false,
            "game_id": this.props.id,
            "display_width": this.props.displayWidth || (Math.min($("body").width() - 50, $("#em10").width() * 2)),
            "square_size": "auto",
            "width" : this.props.width || (this.props.json ? this.props.json.width : 19),
            "height" : this.props.height || (this.props.json ? this.props.json.height : 19)
        }, this.props.json);


        this.goban.on("update", () => {
            this.sync_state();
            if (this.props.onUpdate) {
                this.props.onUpdate();
            }
        });

        this.goban.on("pause-text", (new_text) => this.setState({
            "white_pause_text": new_text.white_pause_text,
            "black_pause_text": new_text.black_pause_text,
        }));
    }

    destroy() {
        if (this.goban) {
            this.goban.destroy();
        }
    }

    sync_state() {
        const score = this.goban.engine.computeScore(true);
        const black = this.props.black;
        const white = this.props.white;
        const player_to_move = (this.goban && this.goban.engine.playerToMove()) || 0;


        const black_points = score.black.prisoners + score.black.komi;
        const white_points = score.white.prisoners + score.white.komi;
        this.setState({
            black_points: interpolate(ngettext("1 point", "{{num}} points", black_points), {num: black_points}),
            white_points: interpolate(ngettext("1 point", "{{num}} points", white_points), {num: white_points}),

            black_name: (typeof(black) === "object" ? (black.username) : black),
            white_name: (typeof(white) === "object" ? (white.username) : white),
            paused: this.state.black_pause_text ? "paused" : "",

            black_rank: (typeof(black) === "object" ? (preferences.get('hide-ranks') ? "" : (" [" + getUserRating(black).bounded_rank_label + "]")) : ""),
            white_rank: (typeof(white) === "object" ? (preferences.get('hide-ranks') ? "" : (" [" + getUserRating(white).bounded_rank_label + "]")) : ""),

            current_users_move: player_to_move === data.get("config.user").id,
            black_to_move_cls: (this.goban && black.id === player_to_move) ? "to-move" : "",
            white_to_move_cls: (this.goban && white.id === player_to_move) ? "to-move" : "",

            in_stone_removal_phase: (this.goban && this.goban.engine.phase === "stone removal"),
            finished: (this.goban && this.goban.engine.phase === "finished"),
        });
    }

    render() {
        if (this.props.noLink) {
            return <div className='MiniGoban nolink'>{this.inner()}</div>;
        } else {
            return <Link to={`/game/${this.props.id}`} className='MiniGoban link'>{this.inner()}</Link>;
        }
    }

    inner() {
        return (
            <div className="inner-container">
                <PersistentElement className={
                    "small board"
                    + (this.state.current_users_move ? " current-users-move" : "")
                    + (this.state.in_stone_removal_phase ? " in-stone-removal-phase" : "")
                    + (this.state.finished ? " finished" : "")
                }
                elt={this.goban_div} />
                <div className={`title-black ${this.state.black_to_move_cls}`}>
                    <span className={`player-name`}>{this.state.black_name}</span>
                    <span className={`player-rank`}>{this.state.black_rank}</span>
                    <Clock compact goban={this.goban} color='black' className='mini-goban' />
                    <span className="score">{this.state.black_points}</span>
                </div>
                <div className={`title-white ${this.state.white_to_move_cls}`}>
                    <span className={`player-name`}>{this.state.white_name}</span>
                    <span className={`player-rank`}>{this.state.white_rank}</span>
                    <Clock compact goban={this.goban} color='white' className='mini-goban' />
                    <span className="score">{this.state.white_points}</span>
                </div>
            </div>
        );
    }


}
