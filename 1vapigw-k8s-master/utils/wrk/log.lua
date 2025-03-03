logfile = io.open("wrk.log", "w");

request = function()
    logfile:write("request:" .. wrk.host .. wrk.method .. "\n");
    return wrk.request();
end

response = function(status, headers, body)
     logfile:write("status:" .. status .. "\n" .. body .. "\n-------------------------------------------------\n");
     for k,v in pairs(headers) do
        logfile:write(k .. ": " .. v .. "\n");
     end
end
