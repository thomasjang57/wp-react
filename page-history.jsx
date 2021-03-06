import React, { Component } from 'react';
import {
    NavLink
} from 'react-router-dom';
import API from './src/js/API.jsx';
import DataStore from './src/js/Stores/DataStore.jsx';
import ServerActions from './src/js/Actions/ServerActions.jsx';

class Item extends Component {
    constructor(props){
        super(props);
        let _ = this;
        _.deletePageFromCache = _.deletePageFromCache.bind(_);
    }
    deletePageFromCache(id){
        delete DataStore.data.pages_cache[id];
        ServerActions.cacheUpdated();
        console.log('Deleted page ' + id + ' from cache.');
    }
    render(){
        let _ = this,
            { url } = _.props,
            { PATHINFO_BASENAME, siteurl } = _.props.wp_vars.constants,
            toUrl = '/'+PATHINFO_BASENAME+url.replace(siteurl, '');

        return (
            <li className="history_item" key={_.props.page_id}>
                <p>Page title: {_.props.the_title} </p>
                <p>Page ID: {_.props.page_id}</p>
                <p>Page URL: <NavLink to={toUrl}>{toUrl}</NavLink></p>
                <p>Request time: {_.props.date_formatted}</p>
                <p>&nbsp;</p>
                <div className="btn" onClick={_.deletePageFromCache.bind(_, _.props.page_id)}>Delete from cache</div>
            </li>
        );
    }
}

class History extends Component {
    constructor(props){
        super(props);
        let _ = this;
        _.onCacheUpdated = _.onCacheUpdated.bind(_);
    }
    onCacheUpdated() {
        this.forceUpdate();
    }
    componentWillMount() {
        let _ = this,
            ds = DataStore;
        ds.on('cacheUpdated', _.onCacheUpdated);
    }
    componentWillUnmount(){
        let _ = this,
            ds = DataStore;
        ds.removeListener('cacheUpdated', _.onCacheUpdated);
    }
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            API.transitionToCurrentPage();
        }
    }
    render() {
        let _ = this,
            blogdescription = '',
            current_page_id = '',
            html = '<div class="loading"></div>',
            pages_cache = DataStore.data.pages_cache,
            pages_cache_html = false;

        if( typeof _.props.current_page != 'undefined' && 
            typeof _.props.current_page_id != 'undefined' && 
            _.props.current_page_id == _.props.current_page.page_id
            ){

            if( _.props.current_page_id.length > 0) {
                current_page_id = _.props.current_page_id;
            }

            if( typeof _.props.current_page.html != 'undefined' ) {
                html = _.props.current_page.html;
            }

        }

        pages_cache_html = Object
            .keys(pages_cache)
            .map( (currentValue, index, array) => {
                if(currentValue != 'last_page_id' && (_.props.current_page_id != currentValue.page_id)){
                    return pages_cache[currentValue];
                }
            })
            .map( (currentValue, index, array) => {
                if(typeof currentValue != 'undefined'){
                    var date = API.timeConvert(currentValue.server_request_time),
                        dateSplit = date.split(/[- :]/),
                        dateArr = new Date(dateSplit[0], dateSplit[1], dateSplit[2], dateSplit[3], dateSplit[4], dateSplit[5]),
                        date_formatted = dateArr.toLocaleString('en-us', { month: "long" }) + ' ' + dateArr.getDate() + ', ' + dateArr.getFullYear() + ', ' + dateArr.getHours() + ':' + dateArr.getMinutes() + ':' + dateArr.getSeconds();

                    return (
                        <Item key = {'history_item_' + currentValue.page_id}
                            page_id = {currentValue.page_id}
                            date_formatted = {date_formatted}
                            url = {currentValue.url}
                            the_title = {currentValue.the_title}
                            {..._.props}
                        />
                    )
                }
            });


        return (
            <div className="clearfix">
                <div dangerouslySetInnerHTML={{__html: html }}></div>
                { pages_cache_html.length > 1 ?
                    <ul id="history_items">{pages_cache_html}</ul>
                    : 
                    <p>Cache is empty.</p>
                }
            </div>
        );
    }
}

export default History;
