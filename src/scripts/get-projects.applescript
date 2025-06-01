on run argv
    -- Optional max results parameter
    set maxResults to -1
    if (count of argv) > 0 then
        try
            set maxResults to (item 1 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set projCount to 0
        
        repeat with proj in projects
            -- Check max results limit
            if maxResults > 0 and projCount ≥ maxResults then
                exit repeat
            end if
            
            try
                -- Only include open projects
                if status of proj is open then
                    set projId to id of proj
                    set projName to name of proj
                    
                    -- Get area name if exists
                    set projArea to ""
                    if area of proj is not missing value then
                        set projArea to name of area of proj
                    end if
                    
                    -- Get tag names
                    set projTags to ""
                    try
                        set projTags to tag names of proj
                        if projTags is missing value then set projTags to ""
                    on error
                        set projTags to ""
                    end try
                    
                    -- Build output line
                    set output to output & projId & "|" & projName & "|" & projArea & "|" & projTags & linefeed
                    set projCount to projCount + 1
                end if
                
            on error errMsg
                log "Error processing project: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run