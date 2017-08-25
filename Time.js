module.exports = class{

    minutes(amount){
        return amount * 60;
    }

    hours(amount){
        return amount * 60 * 60;
    }

    days(amount){
        return amount * 60 * 60 * 24;
    }

    getUTCTimestampMilliseconds(){
        return new Date().getTime();
    }

    getUTCTimestampSeconds(){
        return new Date().getTime() / 1000;
    }

    getUTCDate(){
        let now = new Date();
        return  now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds() + "_" + now.getUTCMilliseconds() + " " + now.getUTCDate() + "." + now.getUTCMonth() + "." +  now.getUTCFullYear();
    }

    getUTCTimeOfDay(){
        let date = this.getUTCDate();
        return date.getUTCHours() / 24 + date.getUTCMinutes() / 24 / 60 + date.getUTCSeconds() / 24 / 60 / 60;
    }

}