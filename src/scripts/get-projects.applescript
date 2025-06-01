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
                    if (count of tags of proj) > 0 then
                        set tagNames to {}
                        repeat with aTag in tags of proj
                            set end of tagNames to name of aTag
                        end repeat
                        set AppleScript's text item delimiters to ","
                        set projTags to tagNames as string
                        set AppleScript's text item delimiters to ""
                    end if
                    
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