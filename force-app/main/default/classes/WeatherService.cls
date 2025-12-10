public class WeatherService {
    /**
     * Gets the weather at Coral Cloud Resorts for the provided date
     */
    public static Weather getResortWeather(Datetime dateToCheck) {
        // Copilot was trained in 2023 so it will use 2023 as the default year if
        // the user does not specify a year in their prompt. This means that we need
        // to adjust the input date to be on the current year.
        Integer currentYear = Date.today().year();
        Integer yearDelta = currentYear - dateToCheck.year();
        dateToCheck = dateToCheck.addYears(yearDelta);
        String isoDate = dateToCheck.format('yyyy-MM-dd');
        String dateString = dateToCheck.format('MMMM d');

        /**
         * Set `makeRealCallout` to true to make a real callout to the weather API.
         * This switch was put into place to help diagnose issues with callouts with
         * Agents in LIVE preview mode.
         */
        String body;
        Boolean makeRealCallout = true;

        // Switch between real and mocked callout.
        if (makeRealCallout) {
            // Prepare API request.
            HttpRequest req = new HttpRequest();
            req.setEndpoint(
                'callout:Weather_Endpoint/weather?lat=37.789782764570425&lon=-122.39723702244089&date=' +
                isoDate
            );
            req.setMethod('GET');
            // Make callout
            Http http = new Http();
            HttpResponse res = http.send(req);
            if (res.getStatusCode() != 200) {
                throw new CalloutException('Bad response: ' + res);
            }

            // The response contains a list of temperatures for different times of the day
            // We parse the response and find the min and max temperatures
            body = res.getBody();
            WeatherApiResponse weatherResponse = (WeatherApiResponse) JSON.deserialize(
                body,
                WeatherAPIResponse.class
            );
        } else {            
            // Prepare mocked response body.
            Decimal mockedLowTempC = 20.0;
            Decimal mockedHighTempC = 30.0;
            body = '{"weather":[{"timestamp":"2025-11-20T12:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1015.8,"sunshine":null,"temperature":' + mockedLowTempC.toString() + ',"wind_direction":45,"wind_speed":9.3,"cloud_cover":100,"dew_point":9.8,"relative_humidity":null,"visibility":4100,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"rain","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"rain"},{"timestamp":"2025-11-20T13:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1015.5,"sunshine":null,"temperature":13.0,"wind_direction":91,"wind_speed":5.5,"cloud_cover":95,"dew_point":null,"relative_humidity":null,"visibility":null,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"rain","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"icon":"rain"},{"timestamp":"2025-11-20T14:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1016.3,"sunshine":null,"temperature":12.7,"wind_direction":337,"wind_speed":14.8,"cloud_cover":94,"dew_point":9.4,"relative_humidity":null,"visibility":10800,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"rain","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"rain"},{"timestamp":"2025-11-20T15:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1016.6,"sunshine":null,"temperature":12.6,"wind_direction":332,"wind_speed":16.7,"cloud_cover":91,"dew_point":9.3,"relative_humidity":null,"visibility":11600,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"rain","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"rain"},{"timestamp":"2025-11-20T16:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1017.2,"sunshine":null,"temperature":12.7,"wind_direction":317,"wind_speed":18.5,"cloud_cover":90,"dew_point":9.4,"relative_humidity":null,"visibility":11900,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"rain","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"rain"},{"timestamp":"2025-11-20T17:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1017.4,"sunshine":null,"temperature":12.1,"wind_direction":320,"wind_speed":11.1,"cloud_cover":92,"dew_point":9.6,"relative_humidity":null,"visibility":7400,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"cloudy"},{"timestamp":"2025-11-20T18:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1018.0,"sunshine":null,"temperature":12.3,"wind_direction":313,"wind_speed":11.1,"cloud_cover":80,"dew_point":10.4,"relative_humidity":null,"visibility":5600,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"cloudy"},{"timestamp":"2025-11-20T19:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1016.5,"sunshine":null,"temperature":12.0,"wind_direction":318,"wind_speed":9.3,"cloud_cover":83,"dew_point":null,"relative_humidity":null,"visibility":null,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"icon":"cloudy"},{"timestamp":"2025-11-20T20:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1017.1,"sunshine":null,"temperature":13.2,"wind_direction":306,"wind_speed":13.0,"cloud_cover":84,"dew_point":9.9,"relative_humidity":null,"visibility":10200,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"cloudy"},{"timestamp":"2025-11-20T21:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1016.6,"sunshine":null,"temperature":13.6,"wind_direction":303,"wind_speed":14.8,"cloud_cover":87,"dew_point":9.6,"relative_humidity":null,"visibility":11900,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"cloudy"},{"timestamp":"2025-11-20T22:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1016.3,"sunshine":null,"temperature":13.9,"wind_direction":308,"wind_speed":14.8,"cloud_cover":90,"dew_point":9.1,"relative_humidity":null,"visibility":13600,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"cloudy"},{"timestamp":"2025-11-20T23:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1015.4,"sunshine":null,"temperature":13.9,"wind_direction":313,"wind_speed":14.8,"cloud_cover":92,"dew_point":9.1,"relative_humidity":null,"visibility":17700,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"cloudy"},{"timestamp":"2025-11-21T00:00:00+00:00","source_id":251,"precipitation":null,"pressure_msl":1015.9,"sunshine":null,"temperature":' + mockedHighTempC.toString() + ',"wind_direction":310,"wind_speed":16.7,"cloud_cover":96,"dew_point":9.2,"relative_humidity":null,"visibility":13800,"wind_gust_direction":null,"wind_gust_speed":null,"condition":"dry","precipitation_probability":null,"precipitation_probability_6h":null,"solar":null,"fallback_source_ids":{},"icon":"cloudy"}],"sources":[{"id":251,"dwd_station_id":null,"observation_type":"forecast","lat":37.75,"lon":-122.22,"height":4.0,"station_name":"OAKLAND INT.","wmo_station_id":"72493","first_record":"2025-11-20T12:00:00+00:00","last_record":"2025-11-30T16:00:00+00:00","distance":16213.0}]}';
        }

        // The response contains a list of temperatures for different times of the day
        // We parse the response and find the min and max temperatures
        WeatherApiResponse weatherResponse = (WeatherApiResponse) JSON.deserialize(
            body,
            WeatherAPIResponse.class
        );

        List<Decimal> temperatures = new List<Decimal>();
        for (TemperatureWrapper item : weatherResponse.weather) {
            if (item.temperature != null) {
                temperatures.add(item.temperature);
            }
        }
        temperatures.sort();

        // Prepare temperatures and description
        Decimal minTempC = temperatures[0];
        Decimal maxTempC = temperatures[temperatures.size() - 1];
        Decimal minTempF = toFahrenheit(minTempC);
        Decimal maxTempF = toFahrenheit(maxTempC);
        String description =
            'On ' +
            dateString +
            ', temperature should be between ' +
            minTempC +
            '°C (' +
            minTempF +
            '°F) and ' +
            maxTempC +
            '°C (' +
            maxTempF +
            '°F) at Coral Cloud Resorts.';

        // Return weather info
        Weather weather = new Weather();
        weather.minTemperatureC = minTempC;
        weather.minTemperatureF = minTempF;
        weather.maxTemperatureC = maxTempC;
        weather.maxTemperatureF = maxTempF;
        weather.description = description;
        return weather;
    }

    private static Decimal toFahrenheit(Decimal celsius) {
        return (celsius * 9 / 5 + 32).setScale(1);
    }

    private class WeatherApiResponse {
        public List<TemperatureWrapper> weather;
    }

    private class TemperatureWrapper {
        public Decimal temperature;
    }

    public class Weather {
        public Decimal minTemperatureC;
        public Decimal minTemperatureF;
        public Decimal maxTemperatureC;
        public Decimal maxTemperatureF;
        public String description;
    }
}