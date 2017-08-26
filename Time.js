module.exports = class{

    minutesSeconds(amount){
        return amount * 60;
    }

    hoursSeconds(amount){
        return amount * 60 * 60;
    }

    daysSeconds(amount){
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

    getUTCGetLastStartOfWeekSeconds(){
        return this.getUTCGetLastEndOfWeekSeconds() - this.daysSeconds(5) + 2;
    }

    getUTCGetLastEndOfWeekSeconds(){
        let daysBack = (new Date().getUTCDay() + 1) % 7;
        let timestamp = new Date().getTime() - this.daysSeconds(daysBack) * 1000;        
        let date = new Date(timestamp);
        date.setUTCHours(0, 0, 0, -1);

        return parseInt(date.getTime() / 1000);
    }
}