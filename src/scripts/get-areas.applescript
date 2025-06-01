on run argv
    tell application "Things3"
        set output to ""
        
        repeat with a in areas
            try
                set areaId to id of a
                set areaName to name of a
                
                -- Build output line
                set output to output & areaId & "|" & areaName & linefeed
                
            on error errMsg
                log "Error processing area: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run